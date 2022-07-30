/*
  Warnings:

  - You are about to drop the column `staticLyrics` on the `Lyrics` table. All the data in the column will be lost.
  - You are about to drop the column `uploader` on the `Lyrics` table. All the data in the column will be lost.
  - Added the required column `uploaderId` to the `Lyrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lyrics" DROP COLUMN "staticLyrics",
DROP COLUMN "uploader",
ADD COLUMN     "uploaderId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Lyrics" ADD CONSTRAINT "Lyrics_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
