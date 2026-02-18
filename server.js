const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);

/* ===============================
   🔥 MIDDLEWARE (VERY IMPORTANT)
   =============================== */
app.use(cors());

// 🔥 THIS FIXES req.body UNDEFINED ERROR
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   🔥 SOCKET.IO SETUP
   =============================== */
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io available in controllers
app.set("io", io);

/* ===============================
   🔥 ROUTES
   =============================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", require("./routes/card.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));

/* ===============================
   🔥 SOCKET EVENTS
   =============================== */
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.mode = "attendance"; // ✅ default mode

  socket.on("setMode", (data) => {
    if (data?.mode === "addcard") {
      socket.mode = "addcard";
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


/* ===============================
   🔥 SERVER START
   =============================== */
server.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:3000");
});
