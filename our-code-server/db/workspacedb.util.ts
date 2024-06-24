import db from "./dbConn";

export const createWorkspace = async (name: string, userId: number) => {
  const workspace = await db.workspace.create({
    data: {
    name,
      user: {
          connect: {
          id: userId,
          },
      },
    },
  });
  
  return workspace;
};

export const getMyWorkspaces = async (userId: number, page: number) => {
  const workspaces = await db.workspace.findMany({
    where: {
      userId,
    },
    skip: page * 10,
    take: 10,
  });

  return workspaces;
};

export const deleteWorkspace = async (workspaceId: number) => {
  await db.workspace.delete({
    where: {
      id: workspaceId,
    },
  });
};