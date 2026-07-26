import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import jwt from "jsonwebtoken";
import { User } from "./models/user.models.js";

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

// Middleware to authenticate Socket.io connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("a secure user connected", socket.id, socket.user?.role);
  
  socket.on("join_room", (room) => {
    // Room Authorization Guard
    if (socket.user?.role === "resident" && room !== socket.user?.flatNo) {
      console.warn(`Unauthorized room join attempt: User ${socket.user?.name} tried to join ${room}`);
      return;
    }
    if (socket.user?.role === "guard" && room !== socket.user?.employeeId) {
      console.warn(`Unauthorized room join attempt: Guard ${socket.user?.name} tried to join ${room}`);
      return;
    }

    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;


connectDB()
  .then(() => {
    
   
      httpServer.listen(PORT, () => {
        console.log(` Local Server running on port ${PORT}`);
      });
    
  })
  .catch((err) => {
    console.error("mongo db connection failed", err);
  });

export default app;
