const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("🌱 Starting seed...");

    // Clear existing data
    await prisma.roomStatus.deleteMany({});
    await prisma.routine.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("✅ Cleared existing data");

    // Create Users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });

    const teacher1 = await prisma.user.create({
      data: {
        name: "Dr. John Smith",
        email: "john.smith@example.com",
        passwordHash: hashedPassword,
        role: "TEACHER",
      },
    });

    const teacher2 = await prisma.user.create({
      data: {
        name: "Prof. Jane Doe",
        email: "jane.doe@example.com",
        passwordHash: hashedPassword,
        role: "TEACHER",
      },
    });

    const assistantAdmin = await prisma.user.create({
      data: {
        name: "Assistant Admin",
        email: "assistant.admin@example.com",
        passwordHash: hashedPassword,
        role: "ASSISTANT_ADMIN",
      },
    });

    const student1 = await prisma.user.create({
      data: {
        name: "Student One",
        email: "student1@example.com",
        passwordHash: hashedPassword,
        role: "STUDENT",
      },
    });

    console.log("✅ Created users");

    // Create Rooms
    const room1 = await prisma.room.create({
      data: {
        room_number: "A101",
        room_type: "Lecture",
      },
    });

    const room2 = await prisma.room.create({
      data: {
        room_number: "A102",
        room_type: "Lecture",
      },
    });

    const room3 = await prisma.room.create({
      data: {
        room_number: "B201",
        room_type: "Lab",
      },
    });

    const room4 = await prisma.room.create({
      data: {
        room_number: "B202",
        room_type: "Lab",
      },
    });

    console.log("✅ Created rooms");

    // Create Courses
    const course1 = await prisma.course.create({
      data: {
        course_code: "CS101",
        course_name: "Introduction to Computer Science",
      },
    });

    const course2 = await prisma.course.create({
      data: {
        course_code: "CS201",
        course_name: "Data Structures",
      },
    });

    const course3 = await prisma.course.create({
      data: {
        course_code: "CS301",
        course_name: "Algorithms",
      },
    });

    const course4 = await prisma.course.create({
      data: {
        course_code: "MATH101",
        course_name: "Calculus I",
      },
    });

    console.log("✅ Created courses");

    // Create Sections
    const sectionA = await prisma.section.create({
      data: {
        section_name: "A",
      },
    });

    const sectionB = await prisma.section.create({
      data: {
        section_name: "B",
      },
    });

    const sectionC = await prisma.section.create({
      data: {
        section_name: "C",
      },
    });

    console.log("✅ Created sections");

    // Create Routines
    const routine1 = await prisma.routine.create({
      data: {
        day: "Monday",
        start_time: "09:00",
        end_time: "10:30",
        class_type: "Lecture",
        teacher: "Dr. John Smith",
        course_id: course1.id,
        section_id: sectionA.id,
        room_id: room1.id,
      },
    });

    const routine2 = await prisma.routine.create({
      data: {
        day: "Monday",
        start_time: "11:00",
        end_time: "12:30",
        class_type: "Lecture",
        teacher: "Prof. Jane Doe",
        course_id: course2.id,
        section_id: sectionB.id,
        room_id: room2.id,
      },
    });

    const routine3 = await prisma.routine.create({
      data: {
        day: "Tuesday",
        start_time: "09:00",
        end_time: "10:30",
        class_type: "Lab",
        teacher: "Dr. John Smith",
        course_id: course1.id,
        section_id: sectionA.id,
        room_id: room3.id,
      },
    });

    const routine4 = await prisma.routine.create({
      data: {
        day: "Wednesday",
        start_time: "14:00",
        end_time: "15:30",
        class_type: "Lecture",
        teacher: "Prof. Jane Doe",
        course_id: course3.id,
        section_id: sectionC.id,
        room_id: room1.id,
      },
    });

    const routine5 = await prisma.routine.create({
      data: {
        day: "Thursday",
        start_time: "10:00",
        end_time: "11:30",
        class_type: "Lecture",
        teacher: "Dr. John Smith",
        course_id: course4.id,
        section_id: sectionB.id,
        room_id: room2.id,
      },
    });

    console.log("✅ Created routines");

    // Create Room Statuses
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.roomStatus.create({
      data: {
        status: "FREE",
        status_date: today,
        routine_id: routine1.id,
        room_id: room1.id,
        updated_by: admin.id,
      },
    });

    await prisma.roomStatus.create({
      data: {
        status: "OCCUPIED",
        status_date: today,
        routine_id: routine2.id,
        room_id: room2.id,
        updated_by: admin.id,
      },
    });

    await prisma.roomStatus.create({
      data: {
        status: "MAINTENANCE",
        status_date: today,
        routine_id: routine3.id,
        room_id: room3.id,
        updated_by: assistantAdmin.id,
      },
    });

    await prisma.roomStatus.create({
      data: {
        status: "FREE",
        status_date: today,
        routine_id: routine4.id,
        room_id: room1.id,
        updated_by: admin.id,
      },
    });

    await prisma.roomStatus.create({
      data: {
        status: "OCCUPIED",
        status_date: today,
        routine_id: routine5.id,
        room_id: room2.id,
        updated_by: assistantAdmin.id,
      },
    });

    console.log("✅ Created room statuses");

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
