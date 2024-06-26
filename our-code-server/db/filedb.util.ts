import { Folder, File } from "@prisma/client";
import db from "./dbConn";

export const createFolder = async (
  name: string,
  workspaceId: number,
  parentId?: number,
) => {
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
      files: {},
    },
    include: {
      workspace: true,
      parent: parentId ? true : false,
    },
  });

  return folder;
};

export const createFile = async (
  name: string,
  workspaceId: number,
  parentId?: number,
) => {
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

export const getCurrentLevelItems = async (
  workspaceId: number,
  parentId: number,
): Promise<{ id: number; name: string; type: string }[]> => {
  let items: { id: number; name: string; type: string }[] = [];

  if (parentId === 0) {
    const folders: Folder[] = await db.folder.findMany({
      where: {
        workspaceId: workspaceId,
        parentId: null,
      },
    });

    items = folders.map((folder: Folder) => ({
      id: folder.id,
      name: folder.name,
      type: "folder",
    }));

    const files: File[] = await db.file.findMany({
      where: {
        workspaceId: workspaceId,
        parentId: null,
      },
    });

    items.push(
      ...files.map((file: File) => ({
        id: file.id,
        name: file.name,
        type: "file",
      })),
    );
  } else {
    const folders: Folder[] = await db.folder.findMany({
      where: {
        workspaceId: workspaceId,
        parentId: parentId,
      },
    });

    items = folders.map((folder: Folder) => ({
      id: folder.id,
      name: folder.name,
      type: "folder",
    }));

    const files: File[] = await db.file.findMany({
      where: {
        workspaceId: workspaceId,
        parentId: parentId,
      },
    });

    items.push(
      ...files.map((file: File) => ({
        id: file.id,
        name: file.name,
        type: "file",
      })),
    );
  }

  return items;
};

export const getFolderById = async (folderId: number) => {
  const folder = await db.folder.findUnique({
    where: {
      id: folderId,
    },
  });
  return folder;
};

export const getFolderByName = async (workspaceId: number, name: string) => {
  const folder = await db.folder.findFirst({
    where: {
      name: name,
      workspaceId: workspaceId,
    },
  });
  return folder;
};

export const getFileById = async (fileId: number) => {
  const file = await db.folder.findUnique({
    where: {
      id: fileId,
    },
  });
  return file;
};

export const getFileByName = async (workspaceId: number, name: string) => {
  const file = await db.file.findFirst({
    where: {
      name: name,
      workspaceId: workspaceId,
    },
  });
  return file;
};

export const deleteFile = async (fileId: number) => {
  const file = await db.file.delete({
    where: {
      id: fileId,
    },
  });
  return file;
};

export const deleteFolder = async (folderId: number) => {
  const folder = await db.folder.delete({
    where: {
      id: folderId,
    },
  });
  return folder;
};
