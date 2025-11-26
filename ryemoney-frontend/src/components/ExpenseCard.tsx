import { Link } from "react-router-dom";
import type { Expense } from "../types/expense";

export default function ExpenseCard({
  e,
  onDelete,
  apiBase,
}: {
  e: Expense;
  onDelete: (id: string) => void;
  apiBase: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-100">{e.description}</h4>
          <p className="text-xs text-slate-400">
            {new Date(e.date).toLocaleDateString("id-ID")}
          </p>
        </div>

        <div className="text-right">
          <div className="font-bold text-slate-100">
            Rp {e.amount.toLocaleString("id-ID")}
          </div>
          <div className="text-xs text-slate-300">{e.category}</div>

          {e.aiNote && (
            <div className="text-xs text-slate-400 mt-1">{e.aiNote}</div>
          )}
        </div>
      </div>

      {e.receiptUrl && (
        <img
          src={`${apiBase}${e.receiptUrl}`}
          alt="receipt"
          className="w-40 rounded-lg border border-slate-800"
        />
      )}

      <div className="flex gap-3 pt-2">
        <Link
          to={`/expenses/${e._id}/edit`}
          className="text-indigo-400 hover:underline text-sm"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(e._id)}
          className="text-rose-400 hover:underline text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
