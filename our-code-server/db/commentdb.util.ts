import db from "./dbConn";

export const getCommentsForFile = async (fileId: number) => {
  const comments = await db.comments.findMany({
    where: {
      fileId: fileId,
    },
    select: {
      id: true,
      content: true,
      relPos: true,
      user: {
        select: {
          email: true,
        },
      },
    }
  });

  return comments;
};

export const createComment = async (content: string, relPos: string, userId: number, fileId: number) => {
  const comment = await db.comments.create({
    data: {
      content,
      relPos,
      user: {
        connect: {
          id: userId,
        },
      },
      file: {
        connect: {
          id: fileId,
        },
      },
    }
  });
  
  return comment;
};

export const deleteComment = async (commentId: number) => {
  const comment = await db.comments.delete({
    where: {
      id: commentId,
    },
  });
  
  return comment;
}
