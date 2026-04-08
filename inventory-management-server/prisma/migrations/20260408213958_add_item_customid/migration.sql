/*
  Warnings:

  - A unique constraint covering the columns `[inventoryId,customId]` on the table `item` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "item" ADD COLUMN     "customId" TEXT;

-- CreateIndex
CREATE INDEX "item_customId_idx" ON "item"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "item_inventoryId_customId_key" ON "item"("inventoryId", "customId");
