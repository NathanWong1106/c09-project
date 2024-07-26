import { Router } from "express";
import {
  getCommentLikesAndDislikes,
  checkCommentImpressionExists,
  userLikedComment,
  userUnlikedComment,
  userDislikedComment,
  userUndislikedComment,
} from "../db/commentlikesdb.util";
import { 
  createComment,
  deleteComment,
} from "../db/commentdb.util";
import { hasPermissionForFile, isAuthenticated } from "../middleware/auth.middleware";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ImpressionType } from "@prisma/client";

const commentRouter = Router();

commentRouter.post("/", hasPermissionForFile, async (req, res) => {
  const userId = req.session.user!.id;
  const fileId = parseInt(req.query.fileId as string);
  const relPos = req.body.relPos;
  const content = req.body.content;
  if (!relPos || !content) {
    return res.status(400).json({ error: "Content and relPos are required" });
  }
  try {
    let newComment: any = await createComment(content, relPos, userId, fileId);
    await req.io.newComment(newComment, fileId);
    return res.status(200).json({ message: "Comment added" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

commentRouter.delete("/", hasPermissionForFile, async (req, res) => {
  const commentId = parseInt(req.query.commentId as string);
  const fileId = parseInt(req.query.fileId as string);
  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }
  try {
    await deleteComment(commentId);
    await req.io.deleteComment(commentId, fileId);
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

commentRouter.get("/impression", hasPermissionForFile, async (req, res) => {
  const commentId = parseInt(req.query.commentId as string);
  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }
  try {
    const impressions = await getCommentLikesAndDislikes(commentId);

    return res.status(200).json({ likes: impressions.likes, dislikes: impressions.dislikes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

commentRouter.post("/like", hasPermissionForFile, async (req, res) => {
  const userId = req.session.user!.id;
  const fileId = parseInt(req.query.fileId as string);
  const commentId = parseInt(req.query.commentId as string);
  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }
  const exists = await checkCommentImpressionExists(commentId, userId, ImpressionType.LIKE);
  try {
    if (exists) {
      await userUnlikedComment(userId, commentId);
      await req.io.likeComment(commentId, fileId, false);
      return res.status(200).json({ message: "Unliked" });
    } else {
      await userLikedComment(commentId, userId);
      await req.io.likeComment(commentId, fileId, true);
      return res.status(200).json({ message: "Liked" });
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // If the user has already disliked the comment, undislike it
      if (error.code === "P2002") {
        return res.status(400).json({ error: "User has already disliked comment" });
      }
    }
  }
});

commentRouter.post("/dislike", hasPermissionForFile, async (req, res) => {
  const userId = req.session.user!.id;
  const fileId = parseInt(req.query.fileId as string);
  const commentId = parseInt(req.query.commentId as string);
  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }
  const exists = await checkCommentImpressionExists(commentId, userId, ImpressionType.DISLIKE);
  try {
    if (exists) {
      await userUndislikedComment(userId, commentId);
      await req.io.dislikeComment(commentId, fileId, false);
      return res.status(200).json({ error: "Undisliked comment" });
    } else {
      await userDislikedComment(commentId, userId);
      await req.io.dislikeComment(commentId, fileId, true);
      return res.status(200).json({ message: "Disliked comment" });
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // If the user has already liked the comment, unlike it
      if (error.code === "P2002") {
        return res.status(400).json({ error: "User has already disliked comment" });
      }
    }
  }
});
export default commentRouter;