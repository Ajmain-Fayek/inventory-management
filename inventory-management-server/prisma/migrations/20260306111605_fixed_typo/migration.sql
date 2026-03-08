/*
  Warnings:

  - You are about to drop the column `customBool1value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customBool2value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customBool3value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customInt1value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customInt2value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customInt3value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customString1value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customString2value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customString3value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customText1value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customText2value` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `customText3value` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "item" DROP COLUMN "customBool1value",
DROP COLUMN "customBool2value",
DROP COLUMN "customBool3value",
DROP COLUMN "customInt1value",
DROP COLUMN "customInt2value",
DROP COLUMN "customInt3value",
DROP COLUMN "customString1value",
DROP COLUMN "customString2value",
DROP COLUMN "customString3value",
DROP COLUMN "customText1value",
DROP COLUMN "customText2value",
DROP COLUMN "customText3value",
ADD COLUMN     "customBool1Value" BOOLEAN,
ADD COLUMN     "customBool2Value" BOOLEAN,
ADD COLUMN     "customBool3Value" BOOLEAN,
ADD COLUMN     "customInt1Value" INTEGER,
ADD COLUMN     "customInt2Value" INTEGER,
ADD COLUMN     "customInt3Value" INTEGER,
ADD COLUMN     "customString1Value" TEXT,
ADD COLUMN     "customString2Value" TEXT,
ADD COLUMN     "customString3Value" TEXT,
ADD COLUMN     "customText1Value" TEXT,
ADD COLUMN     "customText2Value" TEXT,
ADD COLUMN     "customText3Value" TEXT;
