import express from "express";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});