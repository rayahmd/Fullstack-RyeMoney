const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app"); // ini nyari src/app.js
const connectDB = require("./src/config/db"); // nanti kalau sudah ada db.js

connectDB(); // nyalain kalau db.js udah ada

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
