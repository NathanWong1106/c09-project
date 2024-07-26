import { ImpressionType } from "@prisma/client";
import db from "./dbConn";

export const userLikedComment = async (commentId: number, userId: number) => {
  const commentLike = await db.commentImpressions.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      comment: {
        connect: {
          id: commentId,
        },
      },
      type: 'LIKE'
    }
  });
  return commentLike;
};

export const userUnlikedComment = async (userId: number, commentId: number) => {
  const commentLike = await db.commentImpressions.delete({
    where: {
      userId_commentId: {
        userId: userId,
        commentId: commentId,
      },
    },
  });
  
  return commentLike;
};


export const userDislikedComment = async (commentId: number, userId: number) => {
  const commentDislike = await db.commentImpressions.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      comment: {
        connect: {
          id: commentId,
        },
      },
      type: 'DISLIKE'
    }
  })

  return commentDislike;
}

export const userUndislikedComment = async (userId: number, commentId: number) => {
  const commentDislike = await db.commentImpressions.delete({
    where: {
      userId_commentId: {
        userId: userId,
        commentId: commentId,
      },
    },
  });

  return commentDislike;
};

export const getCommentLikesAndDislikes = async (commentId: number) => {
  const [commentLikes, commentDislikes] = await Promise.all([
    db.commentImpressions.count({
      where: {
        commentId: commentId,
        type: 'LIKE',
      },
    }),
    db.commentImpressions.count({
      where: {
        commentId: commentId,
        type: 'DISLIKE',
      },
    }),
  ]);
  
  return {
    likes: commentLikes,
    dislikes: commentDislikes,
  };
}

export const checkCommentImpressionExists = async (commentId: number, userId: number, type: ImpressionType) => {
  const count = await db.commentImpressions.count({
    where: {
      commentId: commentId,
      userId: userId,
      type: type,
    },
  });

  return count > 0;
}