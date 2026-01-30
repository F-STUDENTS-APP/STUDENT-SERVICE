import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { year: '2024/2025' },
    update: {},
    create: {
      year: '2024/2025',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2025-06-20'),
      semester1Start: new Date('2024-07-15'),
      semester1End: new Date('2024-12-20'),
      semester2Start: new Date('2025-01-06'),
      semester2End: new Date('2025-06-20'),
      isActive: true,
    },
  });
  console.log('Created Academic Year:', academicYear.year);

  // 2. Create Class
  const classXIPA1 = await prisma.class.upsert({
    where: { code: 'X-IPA-1' }, // Note: Schema constraint is [code, academicYear] but code isn't unique alone.
    // However, for seeding simplicity let's rely on finding one or creating.
    // Actually, checking schema: @@unique([code, academicYear])
    // So update condition should ideally use that, but Prisma upsert requires unique input.
    // Let's use logic to check or create to avoid complications with unique compound keys in upsert shorthand if slightly off.
    // We'll trust the unique compound key works if we provide valid input.
    // Wait, upsert requires a unique identifier. `code` is NOT unique globally.
    // Let's us findFirst then create if not exists, or just try/catch create.
    update: {},
    create: {
      code: 'X-IPA-1',
      name: '10 IPA 1',
      level: '10',
      major: 'IPA',
      academicYear: academicYear.year,
      capacity: 36,
      currentTotal: 0,
      isActive: true,
      createdBy: 'SYSTEM',
    },
  } as any); // Type casting to avoid complex unique input typings for compound ID in simplified seed

  // Correction: upsert needs `where` matching a unique constraint.
  // The composite unique is `code_academicYear`.
  // Prisma syntax: where: { code_academicYear: { code: 'X-IPA-1', academicYear: '2024/2025' } }

  // Let's rewrite the class creation properly
}

async function realMain() {
  try {
    await main();
  } catch (e) {
    // Retry logic or just simpler logic
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Rewriting main content for correct compilation
async function run() {
  const academicYearVal = '2024/2025';

  // Academic Year
  await prisma.academicYear.upsert({
    where: { year: academicYearVal },
    update: {},
    create: {
      year: academicYearVal,
      startDate: new Date('2024-07-15'),
      endDate: new Date('2025-06-20'),
      semester1Start: new Date('2024-07-15'),
      semester1End: new Date('2024-12-20'),
      semester2Start: new Date('2025-01-06'),
      semester2End: new Date('2025-06-20'),
      isActive: true,
    },
  });

  // Class
  const createdClass = await prisma.class.upsert({
    where: {
      code_academicYear: {
        code: 'X-IPA-1',
        academicYear: academicYearVal,
      },
    },
    update: {},
    create: {
      code: 'X-IPA-1',
      name: '10 IPA 1',
      level: '10',
      major: 'IPA',
      academicYear: academicYearVal,
      createdBy: 'SYSTEM',
    },
  });

  console.log('Seeded successfully');
}

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
