# RyeMoney — AI-Powered Money Tracker

RyeMoney adalah aplikasi pencatat pengeluaran berbasis web yang membantu pengguna melacak transaksi harian, menyimpan bukti struk, serta mendapatkan **klasifikasi kategori otomatis & monthly advice dari AI (Gemini)**. Fokus utama aplikasi ini adalah membantu pengguna lebih sadar terhadap pola pengeluaran dan mengambil keputusan finansial yang lebih baik.

---

## 🎯 Problem Statement (Masalah Nyata)

Banyak orang mencatat pengeluaran secara manual di notes atau tidak mencatat sama sekali. Akibatnya:
- Pengeluaran sulit dipantau.
- Pola boros tidak terlihat.
- Tidak tahu kategori pengeluaran terbesar.
- Tidak ada ringkasan bulanan yang jelas.

---

## ✅ Solution Overview (Solusi yang Dibuat)

RyeMoney menyelesaikan masalah tersebut dengan:
1. **Pencatatan pengeluaran cepat** (amount, deskripsi, tanggal, metode bayar).
2. **Upload bukti/struk** agar transaksi tervalidasi.
3. **AI auto-category**: jika kategori kosong, AI mengklasifikasikan otomatis berdasarkan deskripsi & nominal.
4. **Monthly Insight**:
   - Total & jumlah transaksi bulan tertentu.
   - Breakdown per kategori.
   - Pie & Bar Chart.
   - **Monthly Advice dari AI**.

---

## ✨ Fitur Utama

### 🔐 Authentication
- Register & Login menggunakan JWT.
- Password di-hash dengan bcrypt.
- Token disimpan di localStorage.

### 💸 Expense Management (CRUD)
- Create Expense (dengan atau tanpa kategori).
- Read Expenses.
- Update Expense.
- Delete Expense.
- Filter tampilan per-bulan di dashboard.

### 📎 Upload Receipt
- Upload foto struk/bukti pengeluaran menggunakan multer.
- File disimpan di folder `/uploads`.
- Ditampilkan di UI.

### 🤖 AI Integration (Gemini)
- Auto category + note saat create expense.
- Monthly advice berbasis data bulan terpilih.

### 📊 Monthly Insight & Charts
- Insight per bulan (total, count, per kategori).
- Pie chart & bar chart (Recharts).
- Advice AI dalam bentuk ringkas.

---

## 🧰 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas + Mongoose
- JWT Auth
- bcrypt
- multer (file upload)
- Gemini API (Google GenAI)

### Frontend
- React (Vite)
- TypeScript
- React Router
- Axios
- TailwindCSS
- Framer Motion (animasi)
- Recharts (visualisasi chart)

---

## 📁 Struktur Project (contoh monorepo)

```
RyeMoney/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
    uploads/
    package.json
  frontend/
    src/
      api/
      components/
      pages/
      types/
    package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone repository
```bash
git clone <repo-url>
cd RyeMoney
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder backend:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ryemoney?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
```

Jalankan backend:

```bash
npm run dev
# atau
npm start
```

Backend jalan di:
```
http://localhost:5000
```

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Buat file `.env` di folder frontend:

```env
VITE_API_URL=http://localhost:5000
```

Jalankan frontend:

```bash
npm run dev
```

Frontend jalan di:
```
http://localhost:5173
```

---

## 🔌 API Endpoints 

### Auth
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

### Expenses
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/expenses` | Get semua expense user |
| POST | `/api/expenses` | Create expense (+AI classify +upload receipt) |
| GET | `/api/expenses/:id` | Detail expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Insight
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/expenses/insight/monthly?month=11&year=2025` | Insight bulanan |
| GET | `/api/expenses/insight/advice?month=11&year=2025` | Monthly advice AI |

---


