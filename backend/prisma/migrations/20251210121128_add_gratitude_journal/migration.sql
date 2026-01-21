-- CreateTable
CREATE TABLE "gratitude_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gratitude_entries_userId_createdAt_idx" ON "gratitude_entries"("userId", "createdAt");
