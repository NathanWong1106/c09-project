import { NextFunction, Response, Request } from "express";

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
