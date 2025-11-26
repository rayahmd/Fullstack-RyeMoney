import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { AuthResponse } from "../types/auth";

type Form = { name: string; email: string; password: string };

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState<Form>({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/api/auth/register", form);
      localStorage.setItem("token", res.data.token);
      nav("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-1">Register RyeMoney</h1>
        <p className="text-slate-400 mb-6 text-sm">
          Bikin akun dulu ya.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">Nama</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="name"
              placeholder="Raya Ahmad"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="email"
              type="email"
              placeholder="raya@mail.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="password"
              type="password"
              placeholder="min. 6 karakter"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 transition py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-4">
          Udah punya akun?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
