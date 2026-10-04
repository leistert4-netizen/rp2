const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/users");
const donationRoutes = require("./routes/donations");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Replate backend is running"
  });
});

app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Replate backend running on http://localhost:${PORT}');
});
