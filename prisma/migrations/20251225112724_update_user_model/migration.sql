-- CreateEnum
CREATE TYPE "RoomStatusType" AS ENUM ('FREE', 'OCCUPIED', 'MAINTENANCE', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'ASSISTANT_ADMIN', 'STUDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" UUID NOT NULL,
    "room_number" VARCHAR(10) NOT NULL,
    "room_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "section_name" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" UUID NOT NULL,
    "day" VARCHAR(10) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "class_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "teacher" VARCHAR(20) NOT NULL,
    "course_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomStatus" (
    "id" UUID NOT NULL,
    "status" "RoomStatusType" NOT NULL,
    "status_date" DATE NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "routine_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL,

    CONSTRAINT "RoomStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_code_key" ON "Course"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_name_key" ON "Section"("section_name");

-- CreateIndex
CREATE UNIQUE INDEX "Routine_day_start_time_end_time_room_id_key" ON "Routine"("day", "start_time", "end_time", "room_id");

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomStatus" ADD CONSTRAINT "RoomStatus_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomStatus" ADD CONSTRAINT "RoomStatus_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomStatus" ADD CONSTRAINT "RoomStatus_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
