/*
  Warnings:

  - You are about to drop the column `location` on the `productrequest` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `ProductRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `ProductRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCode` to the `ProductRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `ProductRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inventorylog` ADD COLUMN `processedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `createdById` INTEGER NULL;

-- AlterTable
ALTER TABLE `productrequest` DROP COLUMN `location`,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `locationId` INTEGER NOT NULL,
    ADD COLUMN `productCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `warehouseId` INTEGER NOT NULL,
    ALTER COLUMN `quantity` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductRequest` ADD CONSTRAINT `ProductRequest_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductRequest` ADD CONSTRAINT `ProductRequest_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductRequest` ADD CONSTRAINT `ProductRequest_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
