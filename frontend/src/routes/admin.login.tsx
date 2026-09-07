import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/login", { email, password });
      await queryClient.invalidateQueries({ queryKey: ["admin-me"] });
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(circle at 50% 0%, #241300 0%, #0c0500 70%)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl px-8 py-9"
        style={{
          background: "linear-gradient(170deg,#fffdf7 0%,#fef6e4 60%,#fdefd3 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <p className="text-[9px] tracking-[0.5em] uppercase font-semibold text-center" style={{ color: "#b8860b" }}>
          The Grand Palace
        </p>
        <h1 className="font-display text-3xl text-center mt-1" style={{ color: "#1a0e00" }}>
          Admin Login
        </h1>
        <div className="flex items-center justify-center gap-2 mt-3 mb-7">
          <span className="h-px flex-1" style={{ background: "rgba(200,140,30,0.3)" }} />
          <span className="text-[10px]" style={{ color: "rgba(180,120,20,0.5)" }}>◆</span>
          <span className="h-px flex-1" style={{ background: "rgba(200,140,30,0.3)" }} />
        </div>

        <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "#7a5020" }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 mb-4 text-sm bg-white/70 outline-none border"
          style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
        />

        <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "#7a5020" }}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg px-3.5 py-2.5 mb-2 text-sm bg-white/70 outline-none border"
          style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
        />

        {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2.5 rounded-lg text-[12px] uppercase tracking-widest font-bold transition hover:brightness-105 disabled:opacity-60"
          style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
