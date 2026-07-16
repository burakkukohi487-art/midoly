/*
  Warnings:

  - Added the required column `expiresAt` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `room` ADD COLUMN `expiresAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- 既存行への暫定値付与後、スキーマ通りデフォルトなしに戻す
ALTER TABLE `room` ALTER COLUMN `expiresAt` DROP DEFAULT;
