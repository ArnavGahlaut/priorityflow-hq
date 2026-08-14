import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();
const otpStore = new Map();
const emailOtpStore = new Map();

router.post("/send", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  console.log(`[DEMO SMS] OTP for ${phone}: ${otp}`);
  res.json({ success: true, demoOtp: otp });
});

router.post("/verify", (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore.get(phone);

  if (!record) return res.status(400).json({ error: "No OTP sent to this number" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  otpStore.delete(phone);
  res.json({ success: true, verified: true });
});

router.post("/email/send", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    emailOtpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: '"PriorityQ" <no-reply@priorityq.com>',
      to: email,
      subject: "Your PriorityQ verification code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your PriorityQ verification code is:</p><h2>${otp}</h2><p>Expires in 5 minutes.</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EMAIL OTP] ${email}: ${otp} — Preview: ${previewUrl}`);

    res.json({ success: true, previewUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/email/verify", (req, res) => {
  const { email, otp } = req.body;
  const record = emailOtpStore.get(email);

  if (!record) return res.status(400).json({ error: "No OTP sent to this email" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  emailOtpStore.delete(email);
  res.json({ success: true, verified: true });
});

export default router;
