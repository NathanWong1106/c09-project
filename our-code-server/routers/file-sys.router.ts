import { Router } from "express";
import { createFile, createFolder, getCurrentLevelItems, getFolderByName, getFileByName, deleteFile, deleteFolder } from "../db/filedb.util";

const fileRouter = Router();

fileRouter.get("/", async (req, res) => {
  if (typeof req.query.workspaceId !== "string" || !parseInt(req.query.workspaceId)) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.parentId !== "string") {
    return res.status(400).json({ error: "Parent ID not accepted" });
  }
  const items = await getCurrentLevelItems(parseInt(req.query.workspaceId), parseInt(req.query.parentId));
  return res.status(200).json(items);
});

fileRouter.get("/folder", async (req, res) => {
  if (typeof req.query.workspaceId !== "string" || !parseInt(req.query.workspaceId)) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.folderName !== "string") {
    return res.status(400).json({ error: "No name given" });
  }
  const folder = await getFolderByName(parseInt(req.query.workspaceId), req.query.folderName);
  return res.status(200).json(folder);
});

fileRouter.get("/file", async (req, res) => {
  if (typeof req.query.workspaceId !== "string" || !parseInt(req.query.workspaceId)) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.folderName !== "string") {
    return res.status(400).json({ error: "No name given" });
  }
  const folder = await getFileByName(parseInt(req.query.workspaceId), req.query.folderName);
  return res.status(200).json(folder);
});

fileRouter.post("/", async (req, res) => {
  if (typeof req.query.workspaceId !== "string" || !parseInt(req.query.workspaceId)) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.parentId !== "string" || !parseInt(req.query.parentId)) {
    return res.status(400).json({ error: "Parent ID not accepted" });
  }
  const parentId = parseInt(req.query.parentId) ? parseInt(req.query.parentId) : null;
  if (req.body.type === "folder") {
    const folder = parentId
      ? await createFolder(req.body.name, parseInt(req.query.workspaceId), parentId)
      : await createFolder(req.body.name, parseInt(req.query.workspaceId));
    return res.status(200).json(folder);
  }
  if (req.body.type === "file") {
    const file = parentId
      ? await createFile(req.body.name, parseInt(req.query.workspaceId), parentId)
      : await createFile(req.body.name, parseInt(req.query.workspaceId));
    return res.status(200).json(file);
  }
  else {
    return res.status(400).json({ error: "Type not accepted" });
  }
});

fileRouter.delete("/", async (req, res) => {
  if (typeof req.query.itemId !== "string" || !parseInt(req.query.itemId)) {
    return res.status(400).json({ error: "ID not accepted" });
  }
  if (req.query.type === "folder") {
    await deleteFolder(parseInt(req.query.itemId));
    return res.status(200).json({ message: "Folder deleted" });
  }
  if (req.query.type === "file") {
    await deleteFile(parseInt(req.query.itemId));
    return res.status(200).json({ message: "File deleted" });
  }
  return res.status(400).json({ error: "Type not accepted" });
});

export default fileRouter;
