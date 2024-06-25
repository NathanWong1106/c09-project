import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { createFile, createFolder, getFolderById, } from "../db/filedb.util";

const fileRouter = Router();

fileRouter.post("/", async (req, res) => {
  if (!req.body.content) {
    return res.status(400).json({ error: "Message content is required." });
  }
  if (req.body.type === "folder") {
    
  }
});

export default fileRouter;
