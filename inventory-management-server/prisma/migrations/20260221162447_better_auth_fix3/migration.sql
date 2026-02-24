/*
  Warnings:

  - You are about to drop the column `language` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `user` table. All the data in the column will be lost.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "user_role_idx";

-- DropIndex
DROP INDEX "user_status_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "language",
DROP COLUMN "theme",
ALTER COLUMN "name" SET NOT NULL;
