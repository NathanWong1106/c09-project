/*
  Warnings:

  - You are about to drop the `CommentDislikes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLikes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ImpressionType" AS ENUM ('LIKE', 'DISLIKE');

-- DropForeignKey
ALTER TABLE "CommentDislikes" DROP CONSTRAINT "CommentDislikes_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentDislikes" DROP CONSTRAINT "CommentDislikes_userId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLikes" DROP CONSTRAINT "CommentLikes_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLikes" DROP CONSTRAINT "CommentLikes_userId_fkey";

-- DropTable
DROP TABLE "CommentDislikes";

-- DropTable
DROP TABLE "CommentLikes";

-- CreateTable
CREATE TABLE "CommentImpressions" (
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "type" "ImpressionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentImpressions_pkey" PRIMARY KEY ("userId","commentId")
);

-- AddForeignKey
ALTER TABLE "CommentImpressions" ADD CONSTRAINT "CommentImpressions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentImpressions" ADD CONSTRAINT "CommentImpressions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
