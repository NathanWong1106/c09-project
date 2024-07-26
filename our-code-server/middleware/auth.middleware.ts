import { NextFunction, Response, Request } from "express";
import { hasPermsForFile } from "../db/filedb.util";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  } else {
    next();
  }
};

export const queryHasPermsForFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.query.fileId) {
    return res.status(400).json({ error: "File ID is required" });
  }
  if (
    await hasPermsForFile(
      parseInt(req.query.fileId as string),
      req.session.user!.id
    )
  ) {
    next();
  } else {
    return res.status(403).json({ error: "Permission denied" });
  }
}

export const bodyHasPermsForFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.body.fileId) {
    return res.status(400).json({ error: "File ID is required" });
  }
  if (
    await hasPermsForFile(
      parseInt(req.body.fileId as string),
      req.session.user!.id
    )
  ) {
    next();
  } else {
    return res.status(403).json({ error: "Permission denied" });
  }
}
