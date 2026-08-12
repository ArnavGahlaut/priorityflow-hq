import express from "express";
import Request from "../models/Request.js";
import Counter from "../models/Counter.js";
import Queue from "../models/Queue.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/requests", requireAuth, async (req, res) => {
  const requests = await Request.find().sort({ priority: 1, submittedAt: 1 });
  res.json(requests);
});

router.get("/requests/mine", requireAuth, async (req, res) => {
  const myRequest = await Request.findOne({
    owner: req.user.id,
    status: { $nin: ["COMPLETED", "LEFT"] },
  });
  res.json(myRequest);
});

router.post("/requests", requireAuth, async (req, res) => {
  try {
    const { service, description, queueId, priority, reason, channel } = req.body;
    const lastToken = await Request.findOne().sort({ token: -1 });
    const token = (lastToken?.token || 100) + 1;

    const created = await Request.create({
      token,
      priority,
      suggestedPriority: priority,
      queueId,
      service,
      description,
      reason,
      owner: req.user.id,
      channel: channel || "Web",
      reviewed: priority === "NORMAL" || priority === "LOW",
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/counters", requireAuth, async (req, res) => {
  const counters = await Counter.find().populate("staffId", "name");
  res.json(counters);
});

router.get("/queues", requireAuth, async (req, res) => {
  const queues = await Queue.find();
  res.json(queues);
});

router.patch("/counters/:id/call-next", requireAuth, async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  if (!counter) return res.status(404).json({ error: "Counter not found" });

  const next = await Request.findOne({
    status: "WAITING",
    queueId: { $in: counter.queues },
  }).sort({ priority: 1, submittedAt: 1 });

  if (!next) return res.status(404).json({ error: "No waiting requests" });

  next.status = "CALLED";
  next.counterId = counter._id;
  await next.save();

  counter.servingToken = next.token;
  await counter.save();

  res.json({ counter, request: next });
});

router.patch("/counters/:id/start", requireAuth, async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  const called = await Request.findOne({ counterId: counter._id, status: "CALLED" });
  if (!called) return res.status(400).json({ error: "No called request" });

  called.status = "SERVING";
  await called.save();
  counter.status = "SERVING";
  counter.elapsedSeconds = 0;
  await counter.save();

  res.json({ counter, request: called });
});

router.patch("/counters/:id/complete", requireAuth, async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  const active = await Request.findOne({
    counterId: counter._id,
    status: { $in: ["SERVING", "CALLED"] },
  });
  if (!active) return res.status(400).json({ error: "Nothing in service" });

  active.status = "COMPLETED";
  await active.save();

  counter.status = "AVAILABLE";
  counter.servingToken = null;
  counter.elapsedSeconds = 0;
  counter.servedToday += 1;
  await counter.save();

  res.json({ counter, request: active });
});

// --- NEW ROUTES ---

router.patch("/requests/:id/transfer", requireAuth, async (req, res) => {
  const { queueId } = req.body;
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });

  if (request.counterId) {
    await Counter.findOneAndUpdate(
      { servingToken: request.token },
      { status: "AVAILABLE", servingToken: null, elapsedSeconds: 0 },
    );
  }

  request.queueId = queueId;
  request.status = "WAITING";
  request.counterId = null;
  request.waitedMinutes = 0;
  await request.save();

  res.json(request);
});

router.patch("/requests/:id/priority", requireAuth, async (req, res) => {
  const { priority } = req.body;
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });

  request.priority = priority;
  request.queueId = priority === "CRITICAL" ? "critical" : priority === "HIGH" ? "priority" : request.queueId;
  request.reviewed = true;
  await request.save();

  res.json(request);
});

router.patch("/requests/:id/confirm", requireAuth, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  request.reviewed = true;
  await request.save();
  res.json(request);
});

router.patch("/requests/:id/review", requireAuth, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  request.reviewed = false;
  await request.save();
  res.json(request);
});

router.patch("/requests/:id/leave", requireAuth, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  request.status = "LEFT";
  await request.save();
  res.json(request);
});

router.patch("/queues/:id/toggle-pause", requireAuth, async (req, res) => {
  const queue = await Queue.findOne({ id: req.params.id });
  if (!queue) return res.status(404).json({ error: "Queue not found" });
  queue.paused = !queue.paused;
  await queue.save();
  res.json(queue);
});

export default router;
