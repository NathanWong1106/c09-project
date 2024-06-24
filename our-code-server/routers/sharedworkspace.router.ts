import { Router } from "express";
import { addSharedWorkspace, removeSharedWorkspace } from "../db/sharedworkspacedb.util";
import { isAuthenticated } from "../middleware/auth.middleware";

const sharedWorkspaceRouter = Router();

sharedWorkspaceRouter.post("/add", isAuthenticated, async (req, res) => {
  const workspaceId = req.body.workspaceId;
  const userId = req.session.user!.id;

  try {
    await addSharedWorkspace(workspaceId, userId);
    return res.status(200).json({ message: "Shared with", userId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to share workspace" });
  }
});

sharedWorkspaceRouter.post("/remove", isAuthenticated, async (req, res) => {
  const workspaceId = req.body.workspaceId;
  const userId = req.session.user!.id;

  try {
    await removeSharedWorkspace(workspaceId, userId);
    return res.status(200).json({ message: "Removed " + userId + " from " + workspaceId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove shared workspace" });
  }
});

export default sharedWorkspaceRouter;