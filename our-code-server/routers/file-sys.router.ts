import { Router } from "express";
import { createFile, createFolder, getCurrentLevelItems, getFolderByName } from "../db/filedb.util";

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

fileRouter.post("/", async (req, res) => {
  if (typeof req.query.workspaceId !== "string" || !parseInt(req.query.workspaceId)) {
    return res.status(400).json({ error: "Workspace ID not accepted" });
  }
  if (typeof req.query.parentId !== "string" || !parseInt(req.query.parentId)) {
    return res.status(400).json({ error: "Parent ID not accepted" });
  }
  const parentId = req.query.parentId ? parseInt(req.query.parentId) : null;
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

export default fileRouter;
