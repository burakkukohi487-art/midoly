/*
  Warnings:

  - You are about to drop the column `invireCode` on the `room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inviteCode]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Room_invireCode_key` ON `room`;

-- AlterTable
ALTER TABLE `room` DROP COLUMN `invireCode`,
    ADD COLUMN `inviteCode` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Room_inviteCode_key` ON `Room`(`inviteCode`);
