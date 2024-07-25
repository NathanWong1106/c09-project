-- CreateTable
CREATE TABLE "CommentDislikes" (
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentDislikes_pkey" PRIMARY KEY ("userId","commentId")
);

-- AddForeignKey
ALTER TABLE "CommentDislikes" ADD CONSTRAINT "CommentDislikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDislikes" ADD CONSTRAINT "CommentDislikes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
