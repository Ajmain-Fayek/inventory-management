/*
  Warnings:

  - You are about to drop the column `generatedAt` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `verification` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "verification_identifier_token_key";

-- AlterTable
ALTER TABLE "verification" DROP COLUMN "generatedAt",
DROP COLUMN "token";
