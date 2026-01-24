import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

dotenv.config();

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin:  ["http://localhost:5173",
    "https://visitors-management-alpha.vercel.app"
  ], 
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("join_room", (room) => {
    socket.join(room);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server with Socket.IO running on port ${PORT}`);

    });
  })
  .catch((err) => {
    console.error("mongo db connection failed", err);
  });
export default app;