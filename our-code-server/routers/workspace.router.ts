import { Router } from "express";
import { getMyWorkspaces, createWorkspace, deleteWorkspace, findWorkspaceByName, editWorkspace } from "../db/workspacedb.util";
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
  createWorkspace(userId, name)
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

workspaceRouter.get("/search", isAuthenticated, (req, res) => {
  // add pagination
  const name = req.query.name as string;
  if (!name) {
    return res.status(400).json({ error: "Workspace name is required" });
  }

  findWorkspaceByName(name)
    .then((workspace) => {
      if (workspace) {
        return res.status(200).json({ workspace });
      } else {
        return res.status(404).json({ message: "Workspace not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to find workspace" });
    });
});

workspaceRouter.patch("/edit/:id", isAuthenticated, (req, res) => {
  const workspaceId = parseInt(req.params.id);
  const name = req.body.name;

  editWorkspace(workspaceId, name)
    .then((workspace) => {
      return res.status(200).json({ workspace });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to edit workspace" });
    });
});

export default workspaceRouter;