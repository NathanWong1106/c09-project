import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { hasPermsForFile } from "../db/filedb.util";
import { createComment } from "../db/commentdb.util";

const commentRouter = Router();

commentRouter.post("/", isAuthenticated, async (req, res) => {
  const { content, relPos, fileId } = req.body;
  if (await hasPermsForFile(req.session.user!.id, fileId)) {
  const userId = req.session.user!.id;

  if (!content || !relPos || !fileId) {
    return res.status(400).json({ error: "Content, relPos, and fileId are required" });
  }

  if (!hasPermsForFile(userId, fileId)) {
    return res.status(403).json({ error: "User does not have permissions for this file" });
  }

  createComment(content, relPos, userId, fileId)
    .then((comment) => {
      req.io.to(fileId.toString()).emit("file-edit", comment);
      return res.status(200);
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to create comment" });
    });
  } else {
    return res.status(403).json({ error: "User does not have permissions for this file" });
  }
});

export default commentRouter;