import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routers/auth.router";
import workspaceRouter from "./routers/workspace.router";
import sharedWorkspaceRouter from "./routers/sharedworkspace.router";
import session from "express-session";

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4200",
  credentials: true,
}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

const PORT = process.env.PORT || 3000;

app.use("/auth", authRouter);
app.use("/api/workspace", workspaceRouter);
app.use("/api/sharedworkspace", sharedWorkspaceRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
