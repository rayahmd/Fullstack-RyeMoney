import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ExpenseCard from "../components/ExpenseCard";
import type { Expense } from "../types/expense";
import Navbar from "../components/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import Aurora from "../components/Aurora";

export default function Dashboard() {
  const nav = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const now = new Date();

  // ✅ gabung month+year biar update atomic (anti strictmode double)
  const [view, setView] = useState({
    month: now.getMonth(), // 0-11
    year: now.getFullYear(),
  });

  const [direction, setDirection] = useState<1 | -1>(1);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get<Expense[]>("/api/expenses");
      setExpenses(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal ambil data");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        nav("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Yakin hapus expense ini?")) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal hapus expense");
    }
  };

  // ===== filter per bulan =====
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === view.month && d.getFullYear() === view.year;
    });
  }, [expenses, view.month, view.year]);

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // ===== prev / next bulan + set direction =====
  const goPrevMonth = () => {
    setDirection(-1);
    setView((v) => {
      if (v.month === 0) {
        return { month: 11, year: v.year - 1 };
      }
      return { month: v.month - 1, year: v.year };
    });
  };

  const goNextMonth = () => {
    setDirection(1);
    setView((v) => {
      if (v.month === 11) {
        return { month: 0, year: v.year + 1 };
      }
      return { month: v.month + 1, year: v.year };
    });
  };

  const monthName = new Date(view.year, view.month).toLocaleString("id-ID", {
    month: "long",
  });

  // ===== Animations =====
  const page = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.45,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const monthSlide = {
    enter: (dir: 1 | -1) => ({
      x: dir === 1 ? 80 : -80,
      opacity: 0,
      filter: "blur(6px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: (dir: 1 | -1) => ({
      x: dir === 1 ? -80 : 80,
      opacity: 0,
      filter: "blur(6px)",
      transition: { duration: 0.25, ease: "easeIn" },
    }),
  };

  return (
    <motion.div
      variants={page}
      initial="hidden"
      animate="show"
      className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden"
    >
      {/* ✅ Aurora background */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-60">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* ✅ Pastikan semua konten di atas Aurora */}
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Header konten */}
          <motion.header variants={card} className="space-y-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-400">
              Ringkasan pengeluaran kamu per bulan
            </p>

            {/* ✅ Navigator bulan di tengah */}
            <div className="w-full flex justify-center pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevMonth}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  &lt;
                </button>

                <div className="px-4 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-800 text-sm font-semibold capitalize min-w-[140px] text-center">
                  {monthName} {view.year}
                </div>

                <button
                  onClick={goNextMonth}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  &gt;
                </button>
              </div>
            </div>
          </motion.header>

          {/* ✅ Area yang di-slide saat ganti bulan */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${view.year}-${view.month}`}
              custom={direction}
              variants={monthSlide}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Total box */}
              <motion.section
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4"
              >
                <div className="text-sm text-slate-400">
                  Total pengeluaran {monthName} {view.year}
                </div>
                <div className="text-2xl font-bold mt-1">
                  Rp {total.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {filteredExpenses.length} transaksi
                </div>
              </motion.section>

              {/* List per bulan + AnimatePresence item */}
              <motion.section className="space-y-3">
                {loading ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400"
                  >
                    Loading...
                  </motion.p>
                ) : filteredExpenses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6 text-center text-slate-400"
                  >
                    Belum ada pengeluaran di bulan ini.
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredExpenses.map((e) => (
                      <motion.div
                        key={e._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <ExpenseCard
                          e={e}
                          onDelete={onDelete}
                          apiBase={apiBase}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.section>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
