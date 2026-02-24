/*
  Warnings:

  - You are about to drop the column `userId` on the `verification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identifier,token]` on the table `verification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "verification" DROP CONSTRAINT "verification_userId_fkey";

-- DropIndex
DROP INDEX "verification_userId_key";

-- AlterTable
ALTER TABLE "verification" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_token_key" ON "verification"("identifier", "token");
