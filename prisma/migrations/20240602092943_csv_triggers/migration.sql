/*
  Warnings:

  - A unique constraint covering the columns `[name,createdById]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "triggers" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triggers_tags" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "triggerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "triggers_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "triggers_target_key" ON "triggers"("target");

-- CreateIndex
CREATE UNIQUE INDEX "triggers_tags_triggerId_tagId_key" ON "triggers_tags"("triggerId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_createdById_key" ON "tags"("name", "createdById");

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggers_tags" ADD CONSTRAINT "triggers_tags_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "triggers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggers_tags" ADD CONSTRAINT "triggers_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
