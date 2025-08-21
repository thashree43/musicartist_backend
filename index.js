import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import artistRoutes from "./routes/Artistroute.js";
import searchRoutes from "./routes/Searchroute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["*"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
mongoose
  .connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api", artistRoutes);
app.use("/api", searchRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(` Server running on http://localhost:${port}`)
);
