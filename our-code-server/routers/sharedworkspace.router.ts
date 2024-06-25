import { Router } from "express";
import { addMultiToSharedWorkspace, removeSharedWorkspace, getSharedWorkspaces, findSharedWorkspaceByName } from "../db/sharedworkspacedb.util";
import { isAuthenticated } from "../middleware/auth.middleware";

const sharedWorkspaceRouter = Router();

sharedWorkspaceRouter.get("/", isAuthenticated, (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 0;
  const userId = req.session.user!.id;
  getSharedWorkspaces(userId, page)
    .then((workspaces) => {
      return res.status(200).json({ workspaces });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to get shared workspaces" });
    });
});

sharedWorkspaceRouter.get("/search", isAuthenticated, (req, res) => {
  //TODO: pagination
  const page = req.query.page ? parseInt(req.query.page as string) : 0;
  const name = req.query.name as string;
  const userId = req.session.user!.id;
  if (!name) {
    return res.status(400).json({ error: "Workspace name is required" });
  }

  findSharedWorkspaceByName(userId, name)
    .then((workspace) => {
      if (workspace) {
        return res.status(200).json({ workspace });
      } else {
        return res.status(404).json({ message: "Workspace not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to find shared workspace" });
    });
});

sharedWorkspaceRouter.post("/add", isAuthenticated, async (req, res) => {
  const workspaceId = req.body.workspaceId;
  const members = req.body.members;

  try {
    const userIds = await addMultiToSharedWorkspace(workspaceId, members);
    return res.status(200).json({ message: "Shared with", userIds});
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