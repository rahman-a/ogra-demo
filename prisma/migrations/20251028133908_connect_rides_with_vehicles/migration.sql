/*
  Warnings:

  - Added the required column `vehicleId` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureTime" DATETIME NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "pricePerSeat" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Ride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ride_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ride" ("availableSeats", "createdAt", "deletedAt", "departureTime", "destination", "id", "origin", "pricePerSeat", "status", "updatedAt", "userId") SELECT "availableSeats", "createdAt", "deletedAt", "departureTime", "destination", "id", "origin", "pricePerSeat", "status", "updatedAt", "userId" FROM "Ride";
DROP TABLE "Ride";
ALTER TABLE "new_Ride" RENAME TO "Ride";
CREATE INDEX "Ride_userId_idx" ON "Ride"("userId");
CREATE INDEX "Ride_vehicleId_idx" ON "Ride"("vehicleId");
CREATE INDEX "Ride_status_idx" ON "Ride"("status");
CREATE INDEX "Ride_deletedAt_idx" ON "Ride"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
