-- AlterTable
ALTER TABLE "custom_id_template" ALTER COLUMN "sequenceValue" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "inventory" ALTER COLUMN "customBool1ShowInTable" DROP NOT NULL,
ALTER COLUMN "customBool2ShowInTable" DROP NOT NULL,
ALTER COLUMN "customBool3ShowInTable" DROP NOT NULL,
ALTER COLUMN "customInt1ShowInTable" DROP NOT NULL,
ALTER COLUMN "customInt2ShowInTable" DROP NOT NULL,
ALTER COLUMN "customInt3ShowInTable" DROP NOT NULL,
ALTER COLUMN "customString1ShowInTable" DROP NOT NULL,
ALTER COLUMN "customString2ShowInTable" DROP NOT NULL,
ALTER COLUMN "customString3ShowInTable" DROP NOT NULL,
ALTER COLUMN "customText1ShowInTable" DROP NOT NULL,
ALTER COLUMN "customText2ShowInTable" DROP NOT NULL,
ALTER COLUMN "customText3ShowInTable" DROP NOT NULL;
