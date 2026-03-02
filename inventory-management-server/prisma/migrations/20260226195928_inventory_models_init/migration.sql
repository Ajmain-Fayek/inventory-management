-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL,
    "categoryId" TEXT,
    "creatorId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isInEditMode" BOOLEAN NOT NULL DEFAULT false,
    "editingUserId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "customString1State" BOOLEAN NOT NULL DEFAULT false,
    "customString1Value" TEXT,
    "customString2State" BOOLEAN NOT NULL DEFAULT false,
    "customString2Value" TEXT,
    "customString3State" BOOLEAN NOT NULL DEFAULT false,
    "customString3Value" TEXT,
    "customText1State" BOOLEAN NOT NULL DEFAULT false,
    "customText1Value" TEXT,
    "customText2State" BOOLEAN NOT NULL DEFAULT false,
    "customText2Value" TEXT,
    "customText3State" BOOLEAN NOT NULL DEFAULT false,
    "customText3Value" TEXT,
    "customInt1State" BOOLEAN NOT NULL DEFAULT false,
    "customInt1Value" INTEGER,
    "customInt2State" BOOLEAN NOT NULL DEFAULT false,
    "customInt2Value" INTEGER,
    "customInt3State" BOOLEAN NOT NULL DEFAULT false,
    "customInt3Value" INTEGER,
    "customBool1State" BOOLEAN NOT NULL DEFAULT false,
    "customBool1Value" BOOLEAN,
    "customBool2State" BOOLEAN NOT NULL DEFAULT false,
    "customBool2Value" BOOLEAN,
    "customBool3State" BOOLEAN NOT NULL DEFAULT false,
    "customBool3Value" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "write_access" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "write_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_tag" (
    "inventoryId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_tag_pkey" PRIMARY KEY ("inventoryId","tagId")
);

-- CreateTable
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "isInEditMode" BOOLEAN NOT NULL DEFAULT false,
    "editingUserId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "customString1value" TEXT,
    "customString2value" TEXT,
    "customString3value" TEXT,
    "customText1value" TEXT,
    "customText2value" TEXT,
    "customText3value" TEXT,
    "customInt1value" INTEGER,
    "customInt2value" INTEGER,
    "customInt3value" INTEGER,
    "customBool1value" BOOLEAN,
    "customBool2value" BOOLEAN,
    "customBool3value" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_id_template" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "currentSequence" INTEGER,
    "fixedValueState" BOOLEAN NOT NULL DEFAULT false,
    "fixedValue" TEXT,
    "fixedPosition" INTEGER,
    "sequenceValueState" BOOLEAN NOT NULL DEFAULT false,
    "sequenceValue" INTEGER,
    "sequenceValuePosition" INTEGER,
    "randomValueState" BOOLEAN NOT NULL DEFAULT false,
    "randomValue" TEXT,
    "randomValuePosition" INTEGER,
    "datetimeValueState" BOOLEAN NOT NULL DEFAULT false,
    "datetimeValue" TEXT,
    "datetimeValuePosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_id_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_id_value" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "fixedValue" TEXT,
    "sequenceValue" INTEGER,
    "randomValue" TEXT,
    "datetimeValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_id_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_creatorId_idx" ON "inventory"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_title_key" ON "inventory"("title");

-- CreateIndex
CREATE INDEX "write_access_inventoryId_idx" ON "write_access"("inventoryId");

-- CreateIndex
CREATE INDEX "write_access_userId_idx" ON "write_access"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "write_access_inventoryId_userId_key" ON "write_access"("inventoryId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE INDEX "inventory_tag_inventoryId_idx" ON "inventory_tag"("inventoryId");

-- CreateIndex
CREATE INDEX "inventory_tag_tagId_idx" ON "inventory_tag"("tagId");

-- CreateIndex
CREATE INDEX "custom_id_template_inventoryId_idx" ON "custom_id_template"("inventoryId");

-- CreateIndex
CREATE INDEX "custom_id_value_itemId_idx" ON "custom_id_value"("itemId");

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_editingUserId_fkey" FOREIGN KEY ("editingUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "write_access" ADD CONSTRAINT "write_access_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "write_access" ADD CONSTRAINT "write_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_tag" ADD CONSTRAINT "inventory_tag_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_tag" ADD CONSTRAINT "inventory_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_editingUserId_fkey" FOREIGN KEY ("editingUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_id_template" ADD CONSTRAINT "custom_id_template_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_id_value" ADD CONSTRAINT "custom_id_value_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
