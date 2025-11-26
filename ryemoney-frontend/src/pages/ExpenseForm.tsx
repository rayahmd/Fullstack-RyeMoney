import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import type { Expense } from "../types/expense";
import { motion, AnimatePresence } from "framer-motion";

type FormState = {
  amount: string;
  description: string;
  category: string;
  date: string;
  paymentMethod: string;
};

export default function ExpenseForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>({
    amount: "",
    description: "",
    category: "",
    date: "",
    paymentMethod: "cash",
  });

  const [receipt, setReceipt] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ✅ toast sukses
  const [showToast, setShowToast] = useState(false);

  // helper set date hari ini (YYYY-MM-DD)
  const setTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const iso = `${yyyy}-${mm}-${dd}`;
    setForm((f) => ({ ...f, date: iso }));
  };

  // fetch detail ketika edit
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await api.get<Expense>(`/api/expenses/${id}`);
        const e = res.data;
        setForm({
          amount: String(e.amount),
          description: e.description,
          category: e.category,
          date: e.date.slice(0, 10),
          paymentMethod: e.paymentMethod,
        });
        if (e.receiptUrl) {
          const apiBase =
            import.meta.env.VITE_API_URL || "http://localhost:5000";
          setPreviewUrl(apiBase + e.receiptUrl);
        }
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal ambil detail");
      }
    })();
  }, [id, isEdit]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setReceipt(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (receipt) fd.append("receipt", receipt);

      if (isEdit && id) await api.put(`/api/expenses/${id}`, fd);
      else await api.post("/api/expenses", fd);

      // ✅ show toast dulu
      setShowToast(true);

      // kasih waktu biar toast keliatan
      setTimeout(() => nav("/dashboard"), 900);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal simpan expense");
    } finally {
      setLoading(false);
    }
  };

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
        staggerChildren: 0.07,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const field = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={page}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-slate-950 text-slate-100 relative"
    >
      {/* ✅ Toast sukses */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="
              fixed top-6 left-1/2 -translate-x-1/2 z-[999]
              bg-emerald-500/15 border border-emerald-400/30
              text-emerald-100 px-4 py-2 rounded-xl shadow-lg
              backdrop-blur-xl
            "
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-emerald-300">✅</span>
              Expense tersimpan!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Title */}
        <motion.div variants={card} className="mb-4">
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Expense" : "Tambah Expense"}
          </h1>
          <p className="text-sm text-slate-400">
            Kosongkan kategori atau isi “lainnya” biar AI bantu klasifikasi.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.form
          variants={card}
          onSubmit={onSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
        >
          {/* Amount */}
          <motion.div variants={field}>
            <label className="text-sm text-slate-300">Amount</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="amount"
              type="number"
              placeholder="25000"
              value={form.amount}
              onChange={onChange}
              required
            />
          </motion.div>

          {/* Description */}
          <motion.div variants={field}>
            <label className="text-sm text-slate-300">Description</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="description"
              placeholder="kopi susu"
              value={form.description}
              onChange={onChange}
              required
            />
          </motion.div>

          {/* Category */}
          <motion.div variants={field}>
            <label className="text-sm text-slate-300">Category</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="category"
              placeholder="(boleh kosong / lainnya)"
              value={form.category}
              onChange={onChange}
            />
            <p className="text-xs text-slate-500 mt-1">
              Contoh kategori: makan, transport, hiburan, tagihan, kesehatan.
            </p>
          </motion.div>

          {/* Date + tombol Hari ini */}
          <motion.div variants={field}>
            <label className="text-sm text-slate-300">Date</label>

            <div className="mt-1 flex gap-2">
              <input
                className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
                required
              />

              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={setTodayDate}
                className="shrink-0 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm"
              >
                Hari ini
              </motion.button>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div variants={field}>
            <label className="text-sm text-slate-300">Payment Method</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-indigo-500"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={onChange}
            >
              <option value="cash">Cash</option>
              <option value="ewallet">E-Wallet</option>
              <option value="transfer">Transfer</option>
              <option value="card">Card</option>
            </select>
          </motion.div>

          {/* Receipt */}
          <motion.div variants={field}>
            <label className="text-sm text-slate-300">Receipt (optional)</label>
            <input
              className="mt-1 block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-semibold hover:file:bg-slate-700"
              type="file"
              accept="image/*"
              onChange={onPickFile}
            />

            {previewUrl && (
              <motion.img
                src={previewUrl}
                alt="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="mt-3 w-48 rounded-xl border border-slate-800"
              />
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={field}
            className="flex items-center gap-3 pt-2"
          >
            <motion.button
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </motion.button>

            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              Cancel
            </Link>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
}
