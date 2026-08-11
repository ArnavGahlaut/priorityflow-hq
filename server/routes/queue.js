import express from "express";
import Request from "../models/Request.js";
import Counter from "../models/Counter.js";
import Queue from "../models/Queue.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all requests (waiting/called/serving)
router.get("/requests", requireAuth, async (req, res) => {
  const requests = await Request.find().sort({ priority: 1, submittedAt: 1 });
  res.json(requests);
});

// Get my own request
router.get("/requests/mine", requireAuth, async (req, res) => {
  const myRequest = await Request.findOne({
    owner: req.user.id,
    status: { $nin: ["COMPLETED", "LEFT"] },
  });
  res.json(myRequest);
});

// Submit new request
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

// Get all counters
router.get("/counters", requireAuth, async (req, res) => {
  const counters = await Counter.find().populate("staffId", "name");
  res.json(counters);
});

// Get all queues
router.get("/queues", requireAuth, async (req, res) => {
  const queues = await Queue.find();
  res.json(queues);
});

// Call next request at a counter
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

// Start service
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

// Complete service
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

export default router;
