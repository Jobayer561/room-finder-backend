import express from "express";
import cors from "cors";


const app = express();
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/rooms", roomRoutes);
app.use("/sections", sectionRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
