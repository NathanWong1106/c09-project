import express, { NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routers/auth.router";
import workspaceRouter from "./routers/workspace.router";
import sharedWorkspaceRouter from "./routers/sharedworkspace.router";
import fileRouter from "./routers/file-sys.router";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import { setupIo } from "./socket/sockets";

const app = express();
const httpServer = http.createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
  })
);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
  },
});

// Middleware to add session to socket
io.use((socket, next) => {
  sessionMiddleware(socket.request as express.Request, {} as any, next as NextFunction);
});

setupIo(io);

const PORT = process.env.PORT || 3000;

app.use("/auth", authRouter);
app.use("/api/workspace", workspaceRouter);
app.use("/api/sharedworkspace", sharedWorkspaceRouter);
app.use("/api/fs", fileRouter);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
