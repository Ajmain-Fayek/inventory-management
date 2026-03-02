/*
  Warnings:

  - The primary key for the `inventory_tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tagId` on the `inventory_tag` table. All the data in the column will be lost.
  - Added the required column `tagName` to the `inventory_tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "inventory_tag" DROP CONSTRAINT "inventory_tag_tagId_fkey";

-- DropIndex
DROP INDEX "inventory_tag_tagId_idx";

-- AlterTable
ALTER TABLE "inventory" ALTER COLUMN "quantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "inventory_tag" DROP CONSTRAINT "inventory_tag_pkey",
DROP COLUMN "tagId",
ADD COLUMN     "tagName" TEXT NOT NULL,
ADD CONSTRAINT "inventory_tag_pkey" PRIMARY KEY ("inventoryId", "tagName");

-- CreateIndex
CREATE INDEX "inventory_tag_tagName_idx" ON "inventory_tag"("tagName");

-- AddForeignKey
ALTER TABLE "inventory_tag" ADD CONSTRAINT "inventory_tag_tagName_fkey" FOREIGN KEY ("tagName") REFERENCES "tag"("name") ON DELETE CASCADE ON UPDATE CASCADE;
