/*
  Warnings:

  - You are about to drop the column `locationId` on the `productrequest` table. All the data in the column will be lost.
  - Added the required column `locationCode` to the `ProductRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `productrequest` DROP FOREIGN KEY `ProductRequest_locationId_fkey`;

-- AlterTable
ALTER TABLE `productrequest` DROP COLUMN `locationId`,
    ADD COLUMN `locationCode` VARCHAR(191) NOT NULL;
