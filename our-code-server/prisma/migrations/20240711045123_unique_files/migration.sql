/*
  Warnings:

  - A unique constraint covering the columns `[name,parentId,workspaceId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,parentId,workspaceId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_name_parentId_workspaceId_key" ON "File"("name", "parentId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_workspaceId_key" ON "Folder"("name", "parentId", "workspaceId");
