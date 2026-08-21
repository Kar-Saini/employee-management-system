import prisma from "./utils";
import { VisaAction } from "@prisma/client";

/** entry_date / exit_date are DATE columns — build them at UTC midnight. */
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/** Log timestamps are real instants, written in IST so they read back as IST. */
const at = (iso: string, time: string) => new Date(`${iso}T${time}:00+05:30`);

interface SeedLog {
  action: VisaAction;
  note: string;
  date: string;
  time: string;
}

interface SeedPerson {
  name: string;
  passport_num: string;
  nationality: string;
  entry_date: string;
  exit_date?: string;
  logs: SeedLog[];
}

/**
 * Dummy visa records, spread across every state the Visas page can show:
 * comfortably inside the allowance, approaching the limit, overstayed,
 * departed, and departing on a booked future date.
 */
const VISA_PEOPLE: SeedPerson[] = [
  {
    // Approaching the limit.
    name: "XYZ",
    passport_num: "P8842156",
    nationality: "British",
    entry_date: "2026-03-12",
    logs: [
      {
        action: "ADDED",
        note: "XYZ (British) added to visa tracking",
        date: "2026-03-12",
        time: "09:15",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 12 Mar 2026 at Goa (GOI)",
        date: "2026-03-12",
        time: "09:20",
      },
      {
        action: "UPDATED",
        note: "Passport number corrected after document check",
        date: "2026-04-02",
        time: "11:40",
      },
    ],
  },
  {
    // Close to the limit — should read as critical.
    name: "Chen Wei",
    passport_num: "EG4471203",
    nationality: "Chinese",
    entry_date: "2026-03-01",
    logs: [
      {
        action: "ADDED",
        note: "Chen Wei (Chinese) added to visa tracking",
        date: "2026-03-01",
        time: "18:05",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 01 Mar 2026 at Mumbai (BOM)",
        date: "2026-03-01",
        time: "18:10",
      },
      {
        action: "UPDATED",
        note: "30-day expiry reminder sent to HR",
        date: "2026-07-29",
        time: "10:00",
      },
    ],
  },
  {
    // Freshly arrived.
    name: "Anna Kowalski",
    passport_num: "PL5521904",
    nationality: "Polish",
    entry_date: "2026-07-28",
    logs: [
      {
        action: "ADDED",
        note: "Anna Kowalski (Polish) added to visa tracking",
        date: "2026-07-28",
        time: "07:45",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 28 Jul 2026 at Goa (GOI)",
        date: "2026-07-28",
        time: "07:50",
      },
    ],
  },
  {
    // Mid-stay.
    name: "Marco Rossi",
    passport_num: "YA3391827",
    nationality: "Italian",
    entry_date: "2026-06-05",
    logs: [
      {
        action: "ADDED",
        note: "Marco Rossi (Italian) added to visa tracking",
        date: "2026-06-05",
        time: "22:30",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 05 Jun 2026 at Delhi (DEL)",
        date: "2026-06-05",
        time: "22:35",
      },
    ],
  },
  {
    // Past the 180-day allowance with no exit on record.
    name: "Dmitri Volkov",
    passport_num: "RU7180442",
    nationality: "Russian",
    entry_date: "2026-01-20",
    logs: [
      {
        action: "ADDED",
        note: "Dmitri Volkov (Russian) added to visa tracking",
        date: "2026-01-20",
        time: "13:25",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 20 Jan 2026 at Goa (GOI)",
        date: "2026-01-20",
        time: "13:30",
      },
      {
        action: "UPDATED",
        note: "Overstay flagged — escalated to HR",
        date: "2026-07-20",
        time: "09:05",
      },
    ],
  },
  {
    // Already left the country.
    name: "Sarah Müller",
    passport_num: "C9F8T2K11",
    nationality: "German",
    entry_date: "2026-01-15",
    exit_date: "2026-05-20",
    logs: [
      {
        action: "ADDED",
        note: "Sarah Müller (German) added to visa tracking",
        date: "2026-01-15",
        time: "16:00",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 15 Jan 2026 at Bengaluru (BLR)",
        date: "2026-01-15",
        time: "16:05",
      },
      {
        action: "EXIT",
        note: "Exit recorded for 20 May 2026 — stay closed at 125 days",
        date: "2026-05-20",
        time: "20:15",
      },
    ],
  },
  {
    // Still here, but with a booked departure ahead of the limit.
    name: "Liam O'Brien",
    passport_num: "IE7730055",
    nationality: "Irish",
    entry_date: "2026-08-10",
    exit_date: "2026-09-15",
    logs: [
      {
        action: "ADDED",
        note: "Liam O'Brien (Irish) added to visa tracking",
        date: "2026-08-10",
        time: "11:10",
      },
      {
        action: "ENTRY",
        note: "Entry recorded for 10 Aug 2026 at Goa (GOI)",
        date: "2026-08-10",
        time: "11:15",
      },
      {
        action: "UPDATED",
        note: "Return flight booked for 15 Sep 2026",
        date: "2026-08-14",
        time: "15:50",
      },
    ],
  },
];

async function seedVisas() {
  // Logs carry a foreign key to people, so they have to go first.
  await prisma.visaLog.deleteMany();
  await prisma.visaPerson.deleteMany();

  let logCount = 0;

  for (const person of VISA_PEOPLE) {
    await prisma.visaPerson.create({
      data: {
        name: person.name,
        passport_num: person.passport_num,
        nationality: person.nationality,
        entry_date: day(person.entry_date),
        exit_date: person.exit_date ? day(person.exit_date) : null,
        logs: {
          create: person.logs.map((log) => ({
            action: log.action,
            note: log.note,
            createdAt: at(log.date, log.time),
          })),
        },
      },
    });

    logCount += person.logs.length;
  }

  console.log(`Seeded ${VISA_PEOPLE.length} visa people and ${logCount} logs.`);
}

/** Throwaway employee rows. Not run by default — call it from main() if needed. */
async function seedEmployees() {
  for (let i = 0; i < 6; i++) {
    await prisma.employee.create({
      data: {
        bank: Math.random().toString(),
        bank_acc_num: Math.random().toString(),
        bank_ifsc: Math.random().toString(),
        designation: Math.random().toString(),
        email: Math.random().toString(),
        name: Math.random().toString(),
        pan_num: Math.random().toString(),
        phone_num: Math.random().toString(),
      },
    });
  }
}

async function main() {
  await seedVisas();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
