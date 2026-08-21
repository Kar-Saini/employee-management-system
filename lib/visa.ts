/**
 * Visa stay tracking.
 *
 * A person is allowed VISA_STAY_LIMIT_DAYS in the country counted from their
 * entry date, so the last day they may remain is `entry_date + 180 days`. On
 * the entry date itself the full 180 days are still left.
 *
 * entry_date / exit_date are Postgres DATE columns, so Prisma hands them back
 * as UTC-midnight Dates. All arithmetic below stays on that UTC-midnight scale
 * to keep day counts exact no matter what timezone the browser is in.
 */

export const VISA_STAY_LIMIT_DAYS = 180;

/** At or below this many days left, a stay is worth surfacing to the admin. */
export const VISA_ATTENTION_DAYS_LEFT = 30;

/** A booked exit this close counts as "departing soon". */
export const VISA_DEPARTURE_SOON_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** A stored calendar date, as a UTC-midnight timestamp. */
function dayValue(date: Date) {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** The viewer's current calendar date, on the same UTC-midnight scale. */
function todayValue() {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysBetween(later: number, earlier: number) {
  return Math.round((later - earlier) / MS_PER_DAY);
}

export type VisaLevel = "ok" | "warning" | "critical" | "overstay" | "departed";

/**
 * Tailwind classes per level. Kept beside the level definition so the Visas
 * list, the attention panel and a person's detail page all colour a given
 * state the same way.
 */
export const VISA_LEVEL_STYLES: Record<
  VisaLevel,
  { badge: string; bar: string; text: string }
> = {
  ok: {
    badge: "bg-green-500/10 text-green-400 border-green-500/30",
    bar: "bg-green-400",
    text: "text-green-400",
  },
  warning: {
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    bar: "bg-yellow-400",
    text: "text-yellow-400",
  },
  critical: {
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    bar: "bg-orange-400",
    text: "text-orange-400",
  },
  overstay: {
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    bar: "bg-red-500",
    text: "text-red-400",
  },
  departed: {
    badge: "bg-white/5 text-gray-400 border-white/10",
    bar: "bg-gray-500",
    text: "text-gray-400",
  },
};

export interface VisaStatus {
  level: VisaLevel;
  /** Short human-readable state, e.g. "142 days left". */
  label: string;
  /** Last date the person may remain in the country. */
  limitDate: Date;
  /** Days remaining until limitDate. Negative once the limit has passed. */
  daysLeft: number;
  /** Days of the allowance consumed so far, or the full stay once departed. */
  daysStayed: number;
  /** How much of the 180-day allowance is used, 0-100. */
  percentUsed: number;
  /** True when the recorded exit date falls after the limit date. */
  exceedsLimit: boolean;
  hasDeparted: boolean;
  /** Days until the recorded exit date. Null when no exit is on record. */
  daysUntilExit: number | null;
  /** True when this stay belongs on the "needs attention" list. */
  needsAttention: boolean;
  /** Why it needs attention, or null when nothing is wrong. */
  attentionReason: string | null;
}

export function getVisaStatus(
  entryDate: Date | string,
  exitDate?: Date | string | null,
): VisaStatus {
  const entry = dayValue(new Date(entryDate));
  const exit = exitDate ? dayValue(new Date(exitDate)) : null;
  const today = todayValue();

  const limit = entry + VISA_STAY_LIMIT_DAYS * MS_PER_DAY;
  const limitDate = new Date(limit);

  const daysLeft = daysBetween(limit, today);
  const hasDeparted = exit !== null && exit <= today;
  const exceedsLimit = exit !== null && exit > limit;
  const daysUntilExit = exit !== null ? daysBetween(exit, today) : null;

  // Once they have left, the stay is fixed at entry -> exit. Until then it
  // keeps growing, and is clamped at 0 for an entry date in the future.
  const daysStayed = hasDeparted
    ? daysBetween(exit!, entry)
    : Math.max(0, daysBetween(today, entry));

  const percentUsed = Math.min(
    100,
    Math.max(0, Math.round((daysStayed / VISA_STAY_LIMIT_DAYS) * 100)),
  );

  let level: VisaLevel;
  let label: string;

  if (hasDeparted) {
    level = "departed";
    label = exceedsLimit ? "Departed — overstayed" : "Departed";
  } else if (daysLeft < 0) {
    level = "overstay";
    label = `${Math.abs(daysLeft)} ${plural(Math.abs(daysLeft))} over`;
  } else {
    level =
      daysLeft <= 15 ? "critical" : daysLeft <= 30 ? "warning" : "ok";
    label = `${daysLeft} ${plural(daysLeft)} left`;
  }

  return {
    level,
    label,
    limitDate,
    daysLeft,
    daysStayed,
    percentUsed,
    exceedsLimit,
    hasDeparted,
    daysUntilExit,
    ...attention({
      hasDeparted,
      daysLeft,
      exceedsLimit,
      daysUntilExit,
    }),
  };
}

/**
 * Decides whether a stay needs the admin's attention, and why. Reasons are
 * ordered by how much trouble they represent, so the most serious one wins when
 * several apply at once.
 */
function attention(input: {
  hasDeparted: boolean;
  daysLeft: number;
  exceedsLimit: boolean;
  daysUntilExit: number | null;
}): { needsAttention: boolean; attentionReason: string | null } {
  const { hasDeparted, daysLeft, exceedsLimit, daysUntilExit } = input;

  // Someone who has already left is settled, however their stay went.
  if (hasDeparted) return { needsAttention: false, attentionReason: null };

  if (daysLeft < 0) {
    const over = Math.abs(daysLeft);
    return {
      needsAttention: true,
      attentionReason: `Overstayed by ${over} ${plural(over)}`,
    };
  }

  if (exceedsLimit) {
    return {
      needsAttention: true,
      attentionReason: "Booked exit falls past the allowance",
    };
  }

  if (daysLeft <= VISA_ATTENTION_DAYS_LEFT) {
    return {
      needsAttention: true,
      attentionReason: `Only ${daysLeft} ${plural(daysLeft)} left on the allowance`,
    };
  }

  if (daysUntilExit !== null && daysUntilExit <= VISA_DEPARTURE_SOON_DAYS) {
    return {
      needsAttention: true,
      attentionReason:
        daysUntilExit === 0
          ? "Departing today"
          : `Departing in ${daysUntilExit} ${plural(daysUntilExit)}`,
    };
  }

  return { needsAttention: false, attentionReason: null };
}

function plural(days: number) {
  return days === 1 ? "day" : "days";
}

/**
 * Fixed month abbreviations. Locale "short" months are not a uniform width —
 * both en-IN and en-GB render September as "Sept" while every other month gets
 * three letters, which looks ragged in the aligned card rows.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Formats a stored visa date without shifting it out of its calendar day.
 * Reads UTC parts because entry_date / exit_date are DATE columns.
 */
export function formatVisaDate(date: Date | string) {
  const d = new Date(date);
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Splits a log timestamp into date and time parts. Unlike visa dates these are
 * real instants, so they read in the viewer's local timezone.
 */
export function formatLogStamp(date: Date | string) {
  const d = new Date(date);
  return {
    date: `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/** Orders the most urgent stays first and pushes departed people to the end. */
export function compareVisaUrgency(a: VisaStatus, b: VisaStatus) {
  if (a.hasDeparted !== b.hasDeparted) return a.hasDeparted ? 1 : -1;
  return a.daysLeft - b.daysLeft;
}

/** How serious each level is, for ordering the attention panel. */
const LEVEL_SEVERITY: Record<VisaLevel, number> = {
  overstay: 0,
  critical: 1,
  warning: 2,
  ok: 3,
  departed: 4,
};

/**
 * Orders the attention panel by severity rather than raw days left, so an
 * overstay always outranks someone merely departing soon.
 */
export function compareVisaAttention(a: VisaStatus, b: VisaStatus) {
  const bySeverity = LEVEL_SEVERITY[a.level] - LEVEL_SEVERITY[b.level];
  if (bySeverity !== 0) return bySeverity;
  return a.daysLeft - b.daysLeft;
}

/** The calendar year a stored date falls in, read on the UTC scale. */
export function visaYear(date: Date | string) {
  return new Date(date).getUTCFullYear();
}

/**
 * Parses a date input's "YYYY-MM-DD" into a UTC-midnight Date, so the value
 * lands in the Postgres DATE column as the exact day that was picked.
 * Returns null for a blank or malformed value.
 */
export function parseVisaDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

/** Turns a stored date back into the "YYYY-MM-DD" a date input expects. */
export function toVisaDateInput(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** True when two stored dates land on the same calendar day. */
export function isSameVisaDay(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
) {
  if (!a || !b) return !a && !b;
  return dayValue(new Date(a)) === dayValue(new Date(b));
}


