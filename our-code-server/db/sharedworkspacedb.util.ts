import db from "./dbConn";

export const getSharedWorkspaces = async (userId: number, page: number) => {
  const workspaces = await db.sharedWorkspace.findMany({
    where: {
      userId,
    },
    skip: page * 10,
    take: 10,
    include: {
      workspace: {
        include: {
          user: true,
        },
      },
    },
  });

  return workspaces;
};

export const findSharedWorkspaceByName = async (userId: number, name: string) => {
  const workspace = await db.sharedWorkspace.findMany({
    where: {
      userId,
      workspace: {
        name,
      },
    },
    include: {
      workspace: {
        include: {
          user: true,
        },
      },
    },
  });

  return workspace;
};

export const addMultiToSharedWorkspace = async (workspaceId: number, members: string[]) => {
  const owner = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      user: true,
    },
  });

  const userIds = await db.user.findMany({
    where: {
      email: {
        in: members,
        not: owner?.user.email,
      },
    },
    select: {
      id: true,
    },
  });

  const sharedWorkspace = userIds.map((user) => {
    return {
      userId: user.id,
      workspaceId,
    };
  });

  await db.sharedWorkspace.createMany({
    data: sharedWorkspace,
    skipDuplicates: true,
  });

  return userIds;
};

export const getSharedUsers = async (workspaceId: number) => {
  const users = await db.sharedWorkspace.findMany({
    where: {
      workspaceId,
    },
    select: {
      user: true,
    },
  });

  return users;
}

export const removeSharedWorkspace = async (workspaceId: number, userId: number) => {
  await db.sharedWorkspace.delete({
    where: {
      userId_workspaceId: {
        userId: userId,
        workspaceId: workspaceId,
      },
    },
  });
}