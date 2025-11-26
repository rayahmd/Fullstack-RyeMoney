const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function classifyExpense(description, amount) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `
Klasifikasikan pengeluaran berikut.
Balas HANYA JSON valid dengan format:
{
  "category": "makan|transport|hiburan|tagihan|kesehatan|lainnya",
  "note": "ringkasan singkat 1 kalimat"
}

Deskripsi: "${description}"
Jumlah: ${amount}
`.trim();

  const result = await ai.models.generateContent({
    model,
    // versi SDK terbaru menerima string langsung
    contents: prompt,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  // beberapa versi SDK pakai `result.text`, beberapa pakai `result.response.text()`
  const text =
    result.text ??
    result.response?.text?.() ??
    result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
}

module.exports = { classifyExpense };

async function generateMonthlyAdvice(summary) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `
Kamu adalah asisten keuangan pribadi.
Buat monthly advice singkat (maks 5 bullet + 1 kalimat penutup).
Gunakan bahasa Indonesia santai tapi tetap jelas.
Data bulan ini:
- Bulan/Tahun: ${summary.month}/${summary.year}
- Total: ${summary.grandTotal}
- Jumlah transaksi: ${summary.count}
- Breakdown kategori (urut terbesar):
${summary.byCategory
  .map((c) => `  • ${c.category}: ${c.total}`)
  .join("\n")}

Outputkan HANYA teks advice, tanpa JSON, tanpa markdown code block.
`.trim();

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    generationConfig: { temperature: 0.4 },
  });

  const text =
    result.text ??
    result.response?.text?.() ??
    result.candidates?.[0]?.content?.parts?.[0]?.text;

  return (text || "").trim();
}

module.exports = { classifyExpense, generateMonthlyAdvice };
