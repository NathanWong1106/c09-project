import db from "./dbConn";

export const addSharedWorkspace = async (workspaceId: number, userId: number) => {
  const sharedWorkspace = await db.sharedWorkspace.create({
    data: {
      userId: userId,
      workspaceId: workspaceId,
    },
  });

  return sharedWorkspace;
};

export const removeSharedWorkspace = async (workspaceId: number, userId: number) => {
  await db.sharedWorkspace.delete({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
}