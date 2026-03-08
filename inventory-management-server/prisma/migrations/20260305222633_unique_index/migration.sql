/*
  Warnings:

  - You are about to drop the column `currentSequence` on the `custom_id_template` table. All the data in the column will be lost.
  - The primary key for the `custom_id_value` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `custom_id_value` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inventoryId]` on the table `custom_id_template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventoryId` to the `custom_id_value` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "custom_id_template_inventoryId_idx";

-- AlterTable
ALTER TABLE "custom_id_template" DROP COLUMN "currentSequence";

-- AlterTable
ALTER TABLE "custom_id_value" DROP CONSTRAINT "custom_id_value_pkey",
DROP COLUMN "id",
ADD COLUMN     "inventoryId" TEXT NOT NULL,
ADD CONSTRAINT "custom_id_value_pkey" PRIMARY KEY ("itemId", "inventoryId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_id_template_inventoryId_key" ON "custom_id_template"("inventoryId");

-- CreateIndex
CREATE INDEX "custom_id_value_inventoryId_idx" ON "custom_id_value"("inventoryId");

-- CreateIndex
CREATE INDEX "custom_id_value_createdAt_idx" ON "custom_id_value"("createdAt");

-- AddForeignKey
ALTER TABLE "custom_id_value" ADD CONSTRAINT "custom_id_value_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
