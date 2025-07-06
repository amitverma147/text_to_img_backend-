import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/user.route.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());
await connectDB();

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  return res.send("API WORKING");
});

app.listen(PORT, () => {
  return console.log(`SERVER RUNNING ON PORT 🌍:${PORT}`);
});
