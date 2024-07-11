import db from "./dbConn";

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
