// Bangladesh government public holidays for 2026 (Gregorian dates), used to
// dim holiday cells on the doctor schedule calendar. Islamic-calendar dates
// (Shab-e-Barat, Eid, Ashura, Eid-e-Miladunnabi) are moon-sighting dependent
// and were fixed by government gazette at time of writing — re-verify and
// update this list each year rather than assuming it carries forward.
export const BD_HOLIDAYS_2026: Record<string, string> = {
  "2026-02-04": "Shab-e-Barat",
  "2026-02-21": "International Mother Language Day",
  "2026-03-17": "Sheikh Mujibur Rahman's Birthday & Children's Day",
  "2026-03-18": "Eid-ul-Fitr Holiday",
  "2026-03-19": "Eid-ul-Fitr Holiday",
  "2026-03-20": "Eid-ul-Fitr Holiday (Jumatul Bidah)",
  "2026-03-21": "Eid-ul-Fitr",
  "2026-03-22": "Eid-ul-Fitr Holiday",
  "2026-03-23": "Eid-ul-Fitr Holiday",
  "2026-03-26": "Independence Day",
  "2026-04-13": "Chaitra Sankranti (Hill Districts)",
  "2026-04-14": "Pohela Boishakh",
  "2026-05-01": "May Day / Buddha Purnima",
  "2026-05-26": "Eid-ul-Azha Holiday",
  "2026-05-27": "Eid-ul-Azha Holiday",
  "2026-05-28": "Eid-ul-Azha",
  "2026-05-29": "Eid-ul-Azha Holiday",
  "2026-05-30": "Eid-ul-Azha Holiday",
  "2026-05-31": "Eid-ul-Azha Holiday",
  "2026-06-26": "Ashura",
  "2026-08-05": "July Mass Uprising Day",
  "2026-08-26": "Eid-e-Miladunnabi",
  "2026-09-04": "Janmashtami",
  "2026-10-20": "Durga Puja",
  "2026-10-21": "Durga Puja (Vijaya Dashami)",
  "2026-12-16": "Victory Day",
  "2026-12-25": "Christmas Day",
};

export function getHolidayName(dateStr: string): string | null {
  return BD_HOLIDAYS_2026[dateStr] ?? null;
}

// Bangladesh's weekend is Friday–Saturday, not the Western Sat–Sun.
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}
