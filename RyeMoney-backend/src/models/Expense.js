const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "lainnya" },
    date: { type: Date, required: true },
    paymentMethod: { type: String, default: "cash" },
    // hasil AI (bonus)
    aiCategory: { type: String, default: "" },
    aiNote: { type: String, default: "" },


    // upload bukti/struk (opsional)
    receiptUrl: { type: String, default: "" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);

