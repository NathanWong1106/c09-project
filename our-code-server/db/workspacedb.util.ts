import db from "./dbConn";

export const createWorkspace = async (userId: number, name: string) => {
  const workspace = await db.workspace.create({
    data: {
    name,
      user: {
          connect: {
          id: userId,
          },
      },
    },
    include: {
      user: true,
    }
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
    include: {
      user: true,
    },
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

export const findWorkspaceByName = async (name: string) => {
  const workspace = await db.workspace.findMany({
    where: {
      name,
    },
    include: {
      user: true,
    },
  });

  return workspace;
}

export const editWorkspace = async (workspaceId: number, name: string) => {
  const workspace = await db.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name,
    },
    include: {
      user: true,
    },
  });

  return workspace;
}