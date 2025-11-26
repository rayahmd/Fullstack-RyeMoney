import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import type { MonthlyInsight } from "../types/expense";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

export default function Insight() {
  const nav = useNavigate();

  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const [data, setData] = useState<MonthlyInsight | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchInsightAndAdvice = async () => {
    setLoading(true);
    try {
      const [insightRes, adviceRes] = await Promise.all([
        api.get<MonthlyInsight>(
          `/api/expenses/insight/monthly?month=${month}&year=${year}`
        ),
        api.get<{ advice: string }>(
          `/api/expenses/insight/advice?month=${month}&year=${year}`
        ),
      ]);

      setData(insightRes.data);
      setAdvice(adviceRes.data.advice);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal ambil insight");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        nav("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightAndAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.byCategory.map((c) => ({
      name: c.category,
      value: c.total,
    }));
  }, [data]);

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

  // ===== Animations =====
  const page = {
    hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.08 },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const pop = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={page}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-slate-950 text-slate-100"
    >
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <motion.header variants={card} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Monthly Insight</h1>
            <p className="text-sm text-slate-400">
              Ringkasan pengeluaran per bulan + advice AI
            </p>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => nav("/dashboard")}
            className="bg-slate-800 hover:bg-slate-700 transition px-3 py-2 rounded-lg text-sm"
          >
            ← Back
          </motion.button>
        </motion.header>

        {/* Filter */}
        <motion.section
          variants={card}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="flex-1">
            <label className="text-sm text-slate-300">Bulan</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm text-slate-300">Tahun</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchInsightAndAdvice}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Loading..." : "Generate"}
          </motion.button>
        </motion.section>

        {/* Total */}
        <motion.section
          variants={card}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
        >
          <div className="text-sm text-slate-400">
            Total pengeluaran bulan {month}/{year}
          </div>
          <div className="text-3xl font-bold mt-1">
            Rp {data?.grandTotal?.toLocaleString("id-ID") || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {data?.count || 0} transaksi
          </div>
        </motion.section>

        {/* Charts */}
        <motion.section variants={card} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie */}
          <motion.div
            variants={pop}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
          >
            <h2 className="font-semibold mb-2">Pie Chart</h2>

            {!data || data.byCategory.length === 0 ? (
              <p className="text-slate-400 text-sm">Belum ada data.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                      isAnimationActive={!loading}
                      animationDuration={700}
                    >
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Bar */}
          <motion.div
            variants={pop}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
          >
            <h2 className="font-semibold mb-2">Bar Chart</h2>

            {!data || data.byCategory.length === 0 ? (
              <p className="text-slate-400 text-sm">Belum ada data.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      isAnimationActive={!loading}
                      animationDuration={700}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Advice */}
        <motion.section
          variants={card}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
        >
          <h2 className="font-semibold mb-2">Monthly Advice (AI)</h2>

          {loading && !advice ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-400 text-sm"
            >
              Generating advice...
            </motion.p>
          ) : (
            <motion.pre
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed"
            >
              {advice || "Belum ada advice."}
            </motion.pre>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}
