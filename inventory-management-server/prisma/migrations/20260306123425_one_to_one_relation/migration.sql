/*
  Warnings:

  - A unique constraint covering the columns `[itemId]` on the table `custom_id_value` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "custom_id_value_itemId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "custom_id_value_itemId_key" ON "custom_id_value"("itemId");
