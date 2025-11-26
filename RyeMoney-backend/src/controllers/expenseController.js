const Expense = require("../models/Expense");
const { classifyExpense } = require("../services/geminiService");

// GET /api/expenses
// List semua expense milik user yang login
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/expenses
// Create expense + optional upload receipt + Gemini auto-category
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, category, date, paymentMethod } = req.body;

    if (!amount || !description || !date) {
      return res.status(400).json({
        message: "amount, description, dan date wajib diisi",
      });
    }

    // 1) Panggil AI (fallback aman kalau error / rate limit)
    let aiResult = null;
    try {
      const raw = await classifyExpense(description, amount);
      console.log("GEMINI RAW >>>", raw);

      // ambil JSON object di dalam fence
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in Gemini response");

      aiResult = JSON.parse(match[0]);
    } catch (e) {
      console.log("GEMINI ERROR >>>", e?.message);
      aiResult = null;
    }

    // 2) Final category:
    // - kalau user kosong atau "lainnya" => pakai AI
    // - kalau user isi kategori spesifik => pakai user
    const userCategory = category?.trim();
    const shouldUseAI = !userCategory || userCategory === "lainnya";

    const finalCategory = shouldUseAI
      ? (aiResult?.category || "lainnya")
      : userCategory;

    const expense = await Expense.create({
      amount,
      description,
      category: finalCategory,
      date,
      paymentMethod: paymentMethod || "cash",
      receiptUrl: req.file ? `/uploads/${req.file.filename}` : "",
      aiCategory: aiResult?.category || "",
      aiNote: aiResult?.note || "",
      userId: req.user._id,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/expenses/:id
// Detail expense (hanya pemiliknya)
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Not found" });

    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/expenses/:id
// Update expense + optional replace receipt
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Not found" });

    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { amount, description, category, date, paymentMethod } = req.body;

    expense.amount = amount ?? expense.amount;
    expense.description = description ?? expense.description;
    expense.category = category ?? expense.category;
    expense.date = date ?? expense.date;
    expense.paymentMethod = paymentMethod ?? expense.paymentMethod;

    if (req.file) {
      expense.receiptUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await expense.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/expenses/:id
// Hapus expense (hanya pemiliknya)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Not found" });

    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await expense.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyInsight = async (req, res) => {
  try {
    const month = Number(req.query.month); // 1-12
    const year = Number(req.query.year);   // 2025 dst

    if (!month || !year) {
      return res.status(400).json({ message: "month dan year wajib" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lt: end },
    });

    // hitung total per kategori
    const totals = {};
    let grandTotal = 0;

    for (const e of expenses) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      grandTotal += e.amount;
    }

    // ubah ke array biar enak tampil
    const byCategory = Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    res.json({
      month,
      year,
      grandTotal,
      byCategory,
      count: expenses.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { generateMonthlyAdvice } = require("../services/geminiService");

// GET /api/expenses/insight/advice?month=11&year=2025
exports.getMonthlyAdvice = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: "month dan year wajib" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lt: end },
    });

    if (expenses.length === 0) {
      return res.json({
        advice: "Belum ada data bulan ini. Coba catat pengeluaran dulu ya 🙂",
      });
    }

    // rangkum per kategori
    const totals = {};
    let grandTotal = 0;
    for (const e of expenses) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      grandTotal += e.amount;
    }

    const byCategory = Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    const advice = await generateMonthlyAdvice({
      month,
      year,
      grandTotal,
      byCategory,
      count: expenses.length,
    });

    res.json({ advice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
