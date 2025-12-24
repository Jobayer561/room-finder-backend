/*
  Warnings:

  - You are about to drop the column `status` on the `RoomStatus` table. All the data in the column will be lost.
  - Added the required column `status_date` to the `RoomStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomStatus" DROP COLUMN "status",
ADD COLUMN     "status_date" DATE NOT NULL;
