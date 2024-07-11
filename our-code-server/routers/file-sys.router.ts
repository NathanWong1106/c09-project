import { Router } from "express";
import {
  createFile,
  createFolder,
  getCurrentLevelItems,
  getFolderByName,
  getFileByName,
  deleteFile,
  deleteFolder,
} from "../db/filedb.util";
import { hasPermsForWorkspace } from "../db/workspacedb.util";
import { isAuthenticated } from "../middleware/auth.middleware";

const fileRouter = Router();

fileRouter.get("/", isAuthenticated, async (req, res) => {
  if (
    typeof req.query.workspaceId !== "string" ||
    !parseInt(req.query.workspaceId)
  ) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.parentId !== "string") {
    return res.status(400).json({ error: "Parent ID not accepted" });
  }
  // if (
  //   !(await hasPermsForWorkspace(
  //     parseInt(req.query.workspaceId),
  //     req.session.user!.id
  //   ))
  // ) {
  //   return res.status(403).json({ error: "No permission to view this workspace" });
  // }
  const items = await getCurrentLevelItems(
    parseInt(req.query.workspaceId),
    parseInt(req.query.parentId),
  );
  return res.status(200).json(items);
});

fileRouter.get("/folder", isAuthenticated, async (req, res) => {
  if (
    typeof req.query.workspaceId !== "string" ||
    !parseInt(req.query.workspaceId)
  ) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.folderName !== "string") {
    return res.status(400).json({ error: "No name given" });
  }
  // if (
  //   !(await hasPermsForWorkspace(
  //     parseInt(req.query.workspaceId),
  //     req.session.user!.id
  //   ))
  // ) {
  //   return res.status(403).json({ error: "No permission to view this workspace" });
  // }
  const folder = await getFolderByName(
    parseInt(req.query.workspaceId),
    req.query.folderName,
  );
  return res.status(200).json(folder);
});

fileRouter.get("/file", isAuthenticated, async (req, res) => {
  if (
    typeof req.query.workspaceId !== "string" ||
    !parseInt(req.query.workspaceId)
  ) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.folderName !== "string") {
    return res.status(400).json({ error: "No name given" });
  }
  if (
    !(await hasPermsForWorkspace(
      parseInt(req.query.workspaceId),
      req.session.user!.id
    ))
  ) {
    return res.status(403).json({ error: "No permission to view this workspace" });
  }
  const folder = await getFileByName(
    parseInt(req.query.workspaceId),
    req.query.folderName,
  );
  return res.status(200).json(folder);
});

fileRouter.post("/", isAuthenticated, async (req, res) => {
  if (
    typeof req.query.workspaceId !== "string" ||
    !parseInt(req.query.workspaceId)
  ) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.parentId !== "string") {
    return res.status(400).json({ error: "Parent ID not accepted" });
  }
  if (
    !(await hasPermsForWorkspace(
      parseInt(req.query.workspaceId),
      req.session.user!.id
    ))
  ) {
    return res.status(403).json({ error: "No permission to modify this workspace" });
  }
  const parentId = parseInt(req.query.parentId)
  if (req.body.type === "folder") {
    try {
      const folder = parentId
        ? await createFolder(
            req.body.name,
            parseInt(req.query.workspaceId),
            parentId,
          )
        : await createFolder(
            req.body.name,
            parseInt(req.query.workspaceId)
          );
      return res.status(200).json(folder);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  }
  if (req.body.type === "file") {
    try {
      const file = parentId
        ? await createFile(
            req.body.name,
            parseInt(req.query.workspaceId),
            parentId,
          )
        : await createFile(
            req.body.name,
            parseInt(req.query.workspaceId)
          );
      return res.status(200).json(file);
    }
    catch (e) {
      return res.status(400).json({ error: e });
    }
  } else {
    return res.status(400).json({ error: "Type not accepted" });
  }
});

fileRouter.delete("/", isAuthenticated, async (req, res) => {
  if (
    typeof req.query.workspaceId !== "string" ||
    !parseInt(req.query.workspaceId)
  ) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.itemId !== "string" || !parseInt(req.query.itemId)) {
    return res.status(400).json({ error: "ID not accepted" });
  }
  if (
    !(await hasPermsForWorkspace(
      parseInt(req.query.workspaceId),
      req.session.user!.id
    ))
  ) {
    return res.status(403).json({ error: "No permission to modify this workspace" });
  }
  if (req.query.type === "folder") {
    try {
      await deleteFolder(parseInt(req.query.itemId));
      return res.status(200).json({ message: "Folder deleted" });
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  }
  if (req.query.type === "file") {
    try {
      await deleteFile(parseInt(req.query.itemId));
      return res.status(200).json({ message: "File deleted" });
    }
    catch (e) {
      return res.status(400).json({ error: e });
    }
  }
  return res.status(400).json({ error: "Type not accepted" });
});

export default fileRouter;
