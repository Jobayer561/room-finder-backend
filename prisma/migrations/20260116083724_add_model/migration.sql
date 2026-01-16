-- AlterTable
ALTER TABLE "RoomStatus" ADD COLUMN     "day_of_week" VARCHAR(10),
ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false;
