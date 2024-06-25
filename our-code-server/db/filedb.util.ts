import db from "./dbConn";

export const createFolder = async (name: string, workspaceId: number, parentId: number) => {
  const folder = await db.folder.create({
    data: {
      name: name,
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
      parent: {
        connect: {
          id: parentId,
        },
      },
      files: {
      },
    },
    include: {
      workspace: true,
      parent: true,
    },
  });

  return folder;
};

export const createFile = async (name: string, workspaceId: number, parentId: number) => {
  const file = await db.file.create({
    data: {
      name: name,
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
      parent: {
        connect: {
          id: parentId,
        },
      },
      content: "", // Should probably change format
    },
    include: {
      workspace: true,
      parent: true,
    },
  });

  return file;
};

export const getFolderById = async (folderId: number) => {
  const folder = await db.folder.findUnique({
    where: {
      id: folderId,
    },
  });
  return folder;
};

export const getFolderByName = async (name: string, parentId: number) => {
  const folder = await db.folder.findFirst({
    where: {
      name: name,
      parentId: parentId,
    },
  });
  return folder;
}

export const getFileById = async (fileId: number) => {
  const file = await db.folder.findUnique({
    where: {
      id: fileId,
    },
  });
  return file;
};

export const getFileByName = async (name: string, parentId: number) => {
  const folder = await db.file.findFirst({
    where: {
      name: name,
      parentId: parentId,
    },
  });
  return folder;
}

export const deleteFile = async (fileId: number) => {
  const file = await db.file.delete({
    where: {
      id: fileId,
    },
  });
  return file;
}

export const deleteFolder = async (folderId: number) => {
  const folder = await db.folder.delete({
    where: {
      id: folderId,
    },
  });
  return folder;
}