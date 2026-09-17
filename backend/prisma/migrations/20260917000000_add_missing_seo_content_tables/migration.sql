-- Captures 8 models present in schema.prisma with no prior migration file:
-- BirthdayEnquiry, Enquiry, SeoSetting, Redirect, SiteSeoConfig, PageContent,
-- ContentBlock, ThemeSetting. These existed on the old Neon/SiteGround
-- database (applied there via `prisma db push` at some point, never
-- captured as a migration), which is why `prisma migrate deploy` against a
-- fresh database failed with "table does not exist" on first boot on
-- Contabo. Generated via `prisma migrate diff --from-migrations ... --to-schema-datamodel schema.prisma`.

-- CreateTable
CREATE TABLE "BirthdayEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "guests" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "cake" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BirthdayEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "step" TEXT,
    "sessionId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSetting" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeywords" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "schema" JSONB,
    "headTags" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSeoConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "robotsTxt" TEXT,
    "headerCode" TEXT,
    "footerCode" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSeoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "heroKicker" TEXT,
    "heroHeadlineTop" TEXT,
    "heroHeadlineBottom" TEXT,
    "heroSubtext" TEXT,
    "aboutHeading" TEXT,
    "aboutBody" TEXT,
    "menuSectionHeading" TEXT,
    "menuSectionBody" TEXT,
    "menuSectionImage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "colorSaffron" TEXT,
    "colorGold" TEXT,
    "colorPalace" TEXT,
    "colorCream" TEXT,
    "fontDisplay" TEXT,
    "fontBody" TEXT,
    "baseFontScale" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_sessionId_key" ON "Enquiry"("sessionId");

-- CreateIndex
CREATE INDEX "Enquiry_type_idx" ON "Enquiry"("type");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SeoSetting_path_key" ON "SeoSetting"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_fromPath_key" ON "Redirect"("fromPath");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_path_key" ON "PageContent"("path");

-- CreateIndex
CREATE INDEX "ContentBlock_path_idx" ON "ContentBlock"("path");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_path_key_key" ON "ContentBlock"("path", "key");
