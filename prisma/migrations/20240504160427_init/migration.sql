-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "emailLocalPart" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "timezone" TEXT,
    "currency" TEXT,
    "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "username_locks" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "username_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_groups" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "users_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    CONSTRAINT "personal_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_transactions" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    CONSTRAINT "shared_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_splits" (
    "id" TEXT NOT NULL,
    "paid" INTEGER NOT NULL,
    "owed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "sharedTransactionId" TEXT NOT NULL,
    CONSTRAINT "transaction_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions_tags" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "transactions_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_requests" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_externalId_key" ON "users"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_emailLocalPart_idx" ON "users"("emailLocalPart");

-- CreateIndex
CREATE UNIQUE INDEX "username_locks_username_key" ON "username_locks"("username");

-- CreateIndex
CREATE INDEX "groups_name_idx" ON "groups"("name");

-- CreateIndex
CREATE INDEX "users_groups_userId_idx" ON "users_groups"("userId");

-- CreateIndex
CREATE INDEX "users_groups_groupId_idx" ON "users_groups"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "users_groups_userId_groupId_key" ON "users_groups"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_transactions_transactionId_key" ON "personal_transactions"("transactionId");

-- CreateIndex
CREATE INDEX "personal_transactions_userId_idx" ON "personal_transactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_transactions_transactionId_key" ON "shared_transactions"("transactionId");

-- CreateIndex
CREATE INDEX "shared_transactions_createdById_idx" ON "shared_transactions"("createdById");

-- CreateIndex
CREATE INDEX "shared_transactions_groupId_idx" ON "shared_transactions"("groupId");

-- CreateIndex
CREATE INDEX "transactions_description_idx" ON "transactions"("description");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transaction_splits_sharedTransactionId_idx" ON "transaction_splits"("sharedTransactionId");

-- CreateIndex
CREATE INDEX "transaction_splits_userId_idx" ON "transaction_splits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_splits_sharedTransactionId_userId_key" ON "transaction_splits"("sharedTransactionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_tags_transactionId_tagId_key" ON "transactions_tags"("transactionId", "tagId");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_createdById_idx" ON "tags"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "tags_createdById_name_key" ON "tags"("createdById", "name");

-- CreateIndex
CREATE INDEX "categories_createdById_idx" ON "categories"("createdById");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_createdById_name_key" ON "categories"("createdById", "name");

-- CreateIndex
CREATE UNIQUE INDEX "friend_requests_uniqueId_key" ON "friend_requests"("uniqueId");

-- CreateIndex
CREATE INDEX "friend_requests_fromUserId_idx" ON "friend_requests"("fromUserId");

-- CreateIndex
CREATE INDEX "friend_requests_toUserId_idx" ON "friend_requests"("toUserId");

-- CreateIndex
CREATE INDEX "friend_requests_status_idx" ON "friend_requests"("status");

-- AddForeignKey
ALTER TABLE
    "username_locks"
ADD
    CONSTRAINT "username_locks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "groups"
ADD
    CONSTRAINT "groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE
SET
    NULL ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "users_groups"
ADD
    CONSTRAINT "users_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "users_groups"
ADD
    CONSTRAINT "users_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "personal_transactions"
ADD
    CONSTRAINT "personal_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "personal_transactions"
ADD
    CONSTRAINT "personal_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "shared_transactions"
ADD
    CONSTRAINT "shared_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "shared_transactions"
ADD
    CONSTRAINT "shared_transactions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "shared_transactions"
ADD
    CONSTRAINT "shared_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "transactions"
ADD
    CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE
SET
    NULL ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "transaction_splits"
ADD
    CONSTRAINT "transaction_splits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "transaction_splits"
ADD
    CONSTRAINT "transaction_splits_sharedTransactionId_fkey" FOREIGN KEY ("sharedTransactionId") REFERENCES "shared_transactions"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "settlements"
ADD
    CONSTRAINT "settlements_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "settlements"
ADD
    CONSTRAINT "settlements_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "settlements"
ADD
    CONSTRAINT "settlements_toId_fkey" FOREIGN KEY ("toId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "transactions_tags"
ADD
    CONSTRAINT "transactions_tags_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "transactions_tags"
ADD
    CONSTRAINT "transactions_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "tags"
ADD
    CONSTRAINT "tags_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "categories"
ADD
    CONSTRAINT "categories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "friend_requests"
ADD
    CONSTRAINT "friend_requests_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;

-- AddForeignKey
ALTER TABLE
    "friend_requests"
ADD
    CONSTRAINT "friend_requests_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON
UPDATE
    CASCADE;
