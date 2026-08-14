import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { roleHomePath } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email OTP state (register only)
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpPreviewUrl, setOtpPreviewUrl] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  async function sendOtp() {
    if (!email.trim()) {
      setOtpMessage("Enter your email first");
      return;
    }
    setOtpLoading(true);
    setOtpMessage("");
    try {
      const res = await fetch("https://priorityflow-api.onrender.com/api/otp/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpPreviewUrl(data.previewUrl || "");
        setOtpMessage(
          data.demoOtp
            ? `Demo mode — your code is: ${data.demoOtp}`
            : "OTP sent — check your email",
        );
      } else {
        setOtpMessage(data.error || "Failed to send OTP");
      }
    } catch {
      setOtpMessage("Network error");
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp() {
    setOtpLoading(true);
    setOtpMessage("");
    try {
      const res = await fetch("https://priorityflow-api.onrender.com/api/otp/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailVerified(true);
        setOtpMessage("Email verified");
      } else {
        setOtpMessage(data.error || "Invalid OTP");
      }
    } catch {
      setOtpMessage("Network error");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isRegister && !emailVerified) {
      setError("Please verify your email before creating an account");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? "register" : "login";
      const res = await fetch(`https://priorityflow-api.onrender.com/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { name, email, password } : { email, password },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate({ to: roleHomePath(data.user.role) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/hospital-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-sm border border-white/10 bg-black/60 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <div className="mb-6 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-white/70">
            PriorityQ
          </span>
        </div>
        <h1 className="text-xl font-semibold text-white">
          {isRegister ? "Create account" : "Sign in"}
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailVerified(false);
              setOtpSent(false);
            }}
            disabled={isRegister && emailVerified}
            required
            className="w-full border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40 disabled:opacity-60"
          />

          {isRegister ? (
            <div className="border border-white/10 bg-white/5 p-3">
              {!emailVerified ? (
                <>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading}
                    className="w-full border border-white/20 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    {otpSent ? "Resend OTP" : "Send verification OTP"}
                  </button>
                  {otpSent ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength={4}
                        className="w-24 border border-white/20 bg-white/5 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/40"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otpLoading || otpInput.length < 4}
                        className="flex-1 bg-white px-2 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                  ) : null}
                  {otpPreviewUrl ? (
                    <a
                      href={otpPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-[11px] text-white/60 underline hover:text-white"
                    >
                      Open sent email (test inbox)
                    </a>
                  ) : null}
                  {otpMessage ? (
                    <p className="mt-2 text-[11px] text-white/50">{otpMessage}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-green-400">✓ Email verified</p>
              )}
            </div>
          ) : null}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || (isRegister && !emailVerified)}
            className="w-full bg-white px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
            setEmailVerified(false);
            setOtpSent(false);
          }}
          className="mt-4 text-xs text-white/50 hover:text-white/80"
        >
          {isRegister ? "Already have an account? Sign in" : "New here? Create account"}
        </button>
      </div>
    </div>
  );
}
