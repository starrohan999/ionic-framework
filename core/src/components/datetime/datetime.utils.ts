import { Mode } from '../../interface';

/**
 * Determines whether or not to render the
 * clock/calendar toggle icon as well as the
 * keyboard input icon.
 */
export const shouldRenderViewButtons = (mode: Mode) => {
  /**
   * Toggle icons are for MD only
   */
  return mode === 'md';
}

/**
 * Datetime header is only rendered under
 * the following circumstances:
 * 1. User has slotted in their own title.
 * 2. App is in MD mode and datetime is
 * displayed inline or in a modal.
 */
export const shouldRenderViewHeader = (mode: Mode, presentationType: 'modal' | 'popover' | 'inline' = 'inline', hasSlottedTitle = false) => {
  /**
   * If user has passed in a title,
   * we should always show it.
   */
  if (hasSlottedTitle) { return true; }

  /**
   * iOS does not show a default title
   */
  if (mode === 'ios') { return false; }

  /**
   * The header is not displayed
   * when used as a popover.
   */
  if (presentationType === 'popover') {
    return false;
  }

  return true;
}

/**
 * Given a date object, returns the number
 * of days in that month.
 * Month value begin at 1, not 0.
 * i.e. January = month 1.
 */
export const getNumDaysInMonth = (month: number, year: number) => {
  return (month === 4 || month === 6 || month === 9 || month === 11) ? 30 : (month === 2) ? isLeapYear(year) ? 29 : 28 : 31;
}

/**
 * Determines if given year is a
 * leap year. Returns `true` if year
 * is a leap year. Returns `false`
 * otherwise.
 */
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns an array containing all of the
 * days in a month for a given year. Values are
 * aligned with a week calendar starting on
 * Sunday using null values.
 */
export const getDaysOfMonth = (month: number, year: number) => {
  const numDays = getNumDaysInMonth(month, year);
  const offset = new Date(`${month}/1/${year}`).getDay();

  let days = [];
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }

  for (let i = 0; i < offset; i++) {
    days = [
      null,
      ...days
    ]
  }

  return days;
}

/**
 * Gets the day of the week, month, and day
 * Used for the header in MD mode.
 */
export const getMonthAndDay = (locale: string, date: Date = new Date()) => {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

/**
 * Given a locale and a date object,
 * return a formatted string that includes
 * the month name and full year.
 * Example: May 2021
 */
export const getMonthAndYear = (locale: string, date: Date = new Date()) => {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

/**
 * Given a locale and a mode,
 * return an array with formatted days
 * of the week. iOS should display days
 * such as "Mon" or "Tue".
 * MD should display days such as "M"
 * or "T".
 */
export const getDaysOfWeek = (locale: string, mode: Mode) => {
  /**
   * Nov 1st, 2020 starts on a Sunday.
   * ion-datetime assumes weeks start
   * on Sunday.
   */
  const weekdayFormat = mode === 'ios' ? 'short' : 'narrow';
  const intl = new Intl.DateTimeFormat(locale, { weekday: weekdayFormat })
  const startDate = new Date('11/01/2020');
  const daysOfWeek = [];

  /**
   * For each day of the week,
   * get the day name.
   */
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    daysOfWeek.push(intl.format(currentDate))
  }

  return daysOfWeek;
}
