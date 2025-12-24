/*
  Warnings:

  - You are about to drop the column `course_id` on the `Routine` table. All the data in the column will be lost.
  - You are about to drop the column `section_id` on the `Routine` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `course_code` to the `Routine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_name` to the `Routine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `Routine` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Routine" DROP CONSTRAINT "Routine_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Routine" DROP CONSTRAINT "Routine_section_id_fkey";

-- AlterTable
ALTER TABLE "Routine" DROP COLUMN "course_id",
DROP COLUMN "section_id",
ADD COLUMN     "course_code" VARCHAR(20) NOT NULL,
ADD COLUMN     "course_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "section" VARCHAR(20) NOT NULL;

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Section";
