import express from "express";
import cors from "cors";

const app = express();
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/rooms", roomRoutes);
app.use("/sections", sectionRoutes);
app.use("/routines", routineRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
