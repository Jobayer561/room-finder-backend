-- DropForeignKey
ALTER TABLE "RoomStatus" DROP CONSTRAINT "RoomStatus_routine_id_fkey";

-- AlterTable
ALTER TABLE "RoomStatus" ALTER COLUMN "routine_id" DROP NOT NULL,
ALTER COLUMN "routine_id" SET DATA TYPE uuid;
-- AddForeignKey
ALTER TABLE "RoomStatus" ADD CONSTRAINT "RoomStatus_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;