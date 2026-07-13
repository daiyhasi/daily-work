export type CalendarDay = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeekMonday(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = startOfDay(date);
  monday.setDate(monday.getDate() + mondayOffset);
  return monday;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function getWeekdayMondayFirst(date: Date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function diffInDays(left: Date, right: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(left).getTime() - startOfDay(right).getTime()) / msPerDay);
}

export function getCyclePosition(date: Date, _cycleStart: Date) {
  return {
    week: 1,
    weekday: getWeekdayMondayFirst(date),
  };
}

export function formatChineseMonth(date: Date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

export function formatChineseDate(date: Date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function buildMonthGrid(monthDate: Date) {
  const todayKey = toDateKey(new Date());
  const monthStart = startOfMonth(monthDate);
  const gridStart = startOfWeekMonday(monthStart);

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = addDays(gridStart, index);
    const dateKey = toDateKey(date);

    return {
      date,
      dateKey,
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: dateKey === todayKey,
    };
  });
}
