import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";

const judge0Router = Router();

judge0Router.post("/judge0/callback", isAuthenticated, async (req, res) => {
  let fileId = req.query.fileId;
});