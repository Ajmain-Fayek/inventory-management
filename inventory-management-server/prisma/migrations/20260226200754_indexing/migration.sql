/*
  Warnings:

  - You are about to drop the column `categoryId` on the `inventory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_categoryId_fkey";

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "categoryId",
ADD COLUMN     "categoryName" TEXT;

-- CreateIndex
CREATE INDEX "inventory_categoryName_idx" ON "inventory"("categoryName");

-- CreateIndex
CREATE INDEX "item_inventoryId_idx" ON "item"("inventoryId");

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "category"("name") ON DELETE SET NULL ON UPDATE CASCADE;
