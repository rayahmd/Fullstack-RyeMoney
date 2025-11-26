const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const { getMonthlyInsight, getMonthlyAdvice } = require("../controllers/expenseController");

const {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.use(protect);

router.get("/", getExpenses);

// field file bernama "receipt"
router.post("/", upload.single("receipt"), createExpense);

router.get("/:id", getExpenseById);
router.put("/:id", upload.single("receipt"), updateExpense);
router.delete("/:id", deleteExpense);
router.get("/insight/monthly", getMonthlyInsight);
router.get("/insight/advice", getMonthlyAdvice);


module.exports = router;
