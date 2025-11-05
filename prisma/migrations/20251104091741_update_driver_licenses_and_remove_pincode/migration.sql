/*
  Warnings:

  - You are about to drop the column `licenseDocument` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "licenseDocument",
DROP COLUMN "licenseNumber",
DROP COLUMN "pincode",
ADD COLUMN     "carLicenseDocument" TEXT,
ADD COLUMN     "carLicenseNumber" TEXT,
ADD COLUMN     "driverId" TEXT,
ADD COLUMN     "driverLicenseDocument" TEXT,
ADD COLUMN     "driverLicenseNumber" TEXT;
