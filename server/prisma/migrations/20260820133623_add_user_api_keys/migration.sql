-- CreateTable
CREATE TABLE "user_api_keys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_keys_user_id_provider_key" ON "user_api_keys"("user_id", "provider");
