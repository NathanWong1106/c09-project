import { Router } from "express";
import { getMyWorkspaces, createWorkspace, deleteWorkspace, findWorkspacesByName, editWorkspace, findWorkspaceById, hasPermsForWorkspace } from "../db/workspacedb.util";
import { isAuthenticated } from "../middleware/auth.middleware";

const workspaceRouter = Router();

workspaceRouter.get("/", isAuthenticated, (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 0;
  const userId = req.session.user!.id;

  getMyWorkspaces(userId, page)
    .then((workspaces) => {
      return res.status(200).json({ workspaces: workspaces[0], total: workspaces[1] });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to get workspaces" });
    });
});

workspaceRouter.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.id);
    if (
      !(await hasPermsForWorkspace(
        req.session.user!.id,
        workspaceId
      ))
    ) {
      return res.status(403).json({ error: "No permission to view this workspace" });
    }
    findWorkspaceById(workspaceId)
      .then((workspace) => {
        return res.status(200).json(workspace);
      })
      .catch((err) => {
        return res.status(500).json({ error: "Failed to get workspace" });
      });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get workspace" });
  }
});

workspaceRouter.post("/", isAuthenticated, (req, res) => {
  const name = req.body.name;
  const userId = req.session.user!.id;

  if (!name) {
    return res.status(400).json({ error: "Workspace name is required" });
  }

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

  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required" });
  }

  deleteWorkspace(workspaceId)
    .then(() => {
      return res.status(200).json({ message: "Deleted workspace" });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to delete workspace" });
    });
});

workspaceRouter.get("/search", isAuthenticated, (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 0;
  const name = req.query.name as string;
  if (!name) {
    return res.status(400).json({ error: "Workspace name is required" });
  }

  findWorkspacesByName(name, page)
    .then((workspaces) => {
      if (workspaces[0]) {
        return res.status(200).json({ workspace: workspaces[0], total: workspaces[1] });
      } else {
        return res.status(404).json({ workspace: null, total: 0});
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to find workspace" });
    });
});

workspaceRouter.patch("/edit/:id", isAuthenticated, (req, res) => {
  const workspaceId = parseInt(req.params.id);
  const name = req.body.name;

  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required" });
  }

  if (!name) {
    return res.status(400).json({ error: "Workspace name is required" });
  }

  editWorkspace(workspaceId, name)
    .then((workspace) => {
      return res.status(200).json({ workspace });
    })
    .catch((err) => {
      return res.status(500).json({ error: "Failed to edit workspace" });
    });
});

export default workspaceRouter;