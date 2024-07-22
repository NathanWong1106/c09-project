import db from "./dbConn";

export const getSharedWorkspaces = async (userId: number, page: number) => {
  const workspaces = await db.$transaction([
    db.sharedWorkspace.findMany({
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
    }),
    db.sharedWorkspace.count({
      where: {
        userId,
      },
    }),
  ]);
  return workspaces;
};

export const findSharedWorkspacesByName = async (userId: number, name: string, page: number) => {
  const workspace = await db.$transaction([
    db.sharedWorkspace.findMany({
      where: {
        userId,
        workspace: {
          name: {
            // Replace all whitespace characters with underscores
            // https://github.com/prisma/prisma/issues/8939
            search: name.replace(/[\s\n\t]/g, '_')
          }
        },
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
    }),
    db.sharedWorkspace.count({
      where: {
        userId,
      },
    }),
  ]);

  return workspace;
};

export const addMultiToSharedWorkspace = async (workspaceId: number, members: string[]) => {
  members = [...new Set(members)] 
  const userIds = await db.user.findMany({
    where: {
      email: {
        in: members,
      },
    },
    select: {
      id: true,
    },
  });
  if (userIds.length !== members.length) {
    return { error: "Some users do not exist" };
  };

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