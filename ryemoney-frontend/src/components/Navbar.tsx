import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet } from 'lucide-react';


export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0, filter: "blur(6px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="
        sticky top-3 z-50
        mx-auto w-[calc(100%-1.5rem)] max-w-3xl
        rounded-4xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl backdrop-saturate-150
        shadow-[0_8px_30px_rgba(0,0,0,0.45)]
      "
    >
      {/* glow tipis biar ada efek liquid */}
      <div className="absolute inset-0 rounded-4xl bg-linear-to-r from-white/5 via-white/0 to-white/5 pointer-events-none" />

      <div className="relative px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="font-regular text-lg text-slate-100 tracking-tight"
          >
            <Wallet size={24} className="inline-block mb-1 mx-2 text-indigo-400" />
            <span className="hidden sm:inline-block">RyeMoney</span>
          </motion.div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Insight (Hijau) */}
          <Link to="/insight">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={`
                text-sm px-3 py-2 rounded-xl font-semibold
                border border-emerald-400/30
                bg-emerald-500/15 text-emerald-200
                hover:bg-emerald-500/25 hover:border-emerald-300/50
                transition
                ${isActive("/insight") ? "ring-2 ring-emerald-400/40" : ""}
              `}
            >
              Insight
            </motion.button>
          </Link>

          {/* Tambah Expense */}
          <Link to="/expenses/new">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={`
                text-sm px-3 py-2 rounded-xl font-semibold
                border border-indigo-400/30
                bg-indigo-500/20 text-indigo-100
                hover:bg-indigo-500/30 hover:border-indigo-300/50
                transition
                ${isActive("/expenses") ? "ring-2 ring-indigo-400/40" : ""}
              `}
            >
              + Tambah
            </motion.button>
          </Link>

          {/* Logout */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              localStorage.removeItem("token");
              nav("/login");
            }}
            className="
              text-sm px-3 py-2 rounded-xl
              border border-white/10
              bg-white/5 text-slate-200
              hover:bg-white/10
              transition
            "
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
