import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isRegister ? "register" : "login";
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
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
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">{isRegister ? "Create account" : "Sign in"}</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground"
        >
          {isRegister ? "Already have an account? Sign in" : "New here? Create account"}
        </button>
      </div>
    </div>
  );
}
