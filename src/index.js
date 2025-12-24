import express from "express";
import cors from "cors";

const app = express();
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
