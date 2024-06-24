import { Router } from "express";
import { getMyWorkspaces, createWorkspace, deleteWorkspace } from "../db/workspacedb.util";
import { isAuthenticated } from "../middleware/auth.middleware";

const workspaceRouter = Router();

workspaceRouter.get("/", isAuthenticated, (req, res) => {

  const page = req.query.page ? parseInt(req.query.page as string) : 0;
  const userId = req.session.user!.id;

  getMyWorkspaces(userId, page)
    .then((workspaces) => {
      return res.status(200).json({ workspaces });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to get workspaces" });
    });
});

workspaceRouter.post("/", isAuthenticated, (req, res) => {
  const name = req.body.name;
  const userId = req.session.user!.id;

  createWorkspace(name, userId)
    .then((workspace) => {
      return res.status(200).json({ workspace });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to create workspace" });
    });
});

workspaceRouter.delete("/:id", isAuthenticated, (req, res) => {
  const workspaceId = parseInt(req.params.id);

  deleteWorkspace(workspaceId)
    .then(() => {
      return res.status(200).json({ message: "Deleted workspace" });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to delete workspace" });
    });
});

export default workspaceRouter;