import CONFIG from '@/lib/configs';
import { DropdownOption } from '@/types/dropdown';

// inspiration from https://stackoverflow.com/a/57941711/22063638
// example timestamp format: 2024-01-18T11:22:40+00:00
// WARNING: assumes +00:00 (which should be the case for timestamptz)
export const timestampStringToDate = (ts: string): Date => {
  const digits = ts.split(/\D/).map(s => parseInt(s, 10));
  digits[1] -= 1; // ground month to 0-index

  const ms = Date.UTC(
    digits[0], // year
    digits[1], // month
    digits[2], // day
    digits[3], // hour
    digits[4], // minute
    digits[5], // second
    0,
  );

  return new Date(ms);
};

// parse js date to mm/dd/yyyy
export const parseDate = (d: Date): string => d.toLocaleDateString();

// format timestamp string
export const formatTimestamp = (timestamp?: string): string =>
  timestamp ? parseDate(timestampStringToDate(timestamp)) : 'Not Available';

// parse js date to yyyy-mm-dd
export const parseDateAlt = (d: Date): string =>
  `${d.getFullYear().toString().padStart(4, '0')}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

// check if a string is a valid bar number
export const isValidBarNumber = (b: string): boolean => /^\d{1,6}$/.test(b);

/**
 * @param d - string in date format (i.e. yyyy-mm-dd)
 * @returns JS Date in UTC-0 timezone
 */
export const getUTCDate = (d: string) => new Date(`${d}T00:00`);

/**
 * @param d - date in string format
 * @returns true if the date is an upcoming date, false otherwise
 */
export const isValidDate = (d: string) => {
  const currentDate = new Date();
  const inputDate = getUTCDate(d);
  currentDate.setHours(0, 0, 0, 0);

  if (d !== '' && inputDate >= currentDate) {
    return true;
  }
  return false;
};

/**
 * If the description is used for the case listing cards, CARD should be passed in as
 * TRUE, FALSE otherwise.
 * @param attorney - a boolean indicating whether a case needs an attorney.
 * @param interpreter - a boolean indicating whether a case needs an interpreter.
 * @param card a boolean indicating whether the description will be used for a case listing card.
 * @returns appropriate description for roles needed field based on the attorney & interpreter parameters.
 */
export const parseRolesNeeded = (
  card: boolean,
  attorney?: boolean,
  interpreter?: boolean,
) => {
  if (interpreter && attorney) {
    return card ? 'Interpreter & Attorney' : 'Attorney, Interpreter';
  }
  return interpreter ? 'Interpreter' : 'Attorney';
};

/**
 * @param hoursPerWeek - expected hours/weeks rate a volunteer or attorney spends on a case.
 * @param numWeeks expected number of weeks a volunteer/attorney will help with the case.
 * @returns appropriate format for the time commitment description based on the parameters.
 */
export const parseTimeCommitment = (
  hoursPerWeek?: number,
  numWeeks?: number,
) => {
  if (
    (hoursPerWeek === undefined || hoursPerWeek === null) &&
    (numWeeks === undefined || numWeeks === null)
  )
    return 'To Be Determined';
  if (numWeeks === undefined || numWeeks === null)
    return `${hoursPerWeek} hours/week`;

  const unit = numWeeks > 4 ? 'month' : 'week';
  const numUnit = numWeeks > 4 ? numWeeks / 4 : numWeeks;
  const plural = numUnit > 1 ? 's' : '';
  if (hoursPerWeek === undefined || hoursPerWeek === null)
    return `${numWeeks} ${unit}${plural}`;

  const rate = numWeeks > 4 ? hoursPerWeek * 4 : hoursPerWeek;
  return `${rate} hours/${unit} for ${numUnit} ${unit}${plural}`;
};

// return JS date object with current date at 00:00:00
export const getCurrentDate = () => {
  const now = new Date();
  const nowDate = parseDateAlt(now);
  return new Date(`${nowDate}T00:00`);
};

// parse value to three strings depending on truthy, falsy, and nullish
export const formatTruthy = <
  T extends string | undefined,
  F extends string | undefined,
  N extends string | undefined,
>(
  obj: unknown,
  truthyMessage: T,
  falsyMessage: F,
  nullishMessage: N,
) => {
  if (obj === null || obj === undefined) return nullishMessage;
  return obj ? truthyMessage : falsyMessage;
};

/**
 * filters the given options by the search string
 * returns a list of more options for the big data dropdown
 *  and a boolean for it to know whether there are more options
 */
export const filterAndPaginate = (
  options: DropdownOption[],
  search: string,
  oldLength: number,
  pageSize: number = CONFIG.pageSize,
) => {
  const searchLower = search.toLowerCase();
  const filteredOptions = search
    ? options.filter(o => o.label.toLowerCase().includes(searchLower))
    : options;
  const hasMore = filteredOptions.length > oldLength + pageSize;
  const slicedOptions = filteredOptions.slice(oldLength, oldLength + pageSize);
  return {
    options: slicedOptions,
    hasMore,
  };
};

// to use as empty function
export const identity = (x: unknown) => x;

// format a list into a grammatically correct enumeration
// EXAMPLE USAGE:
//   formatEnumeration([]) => ""
//   formatEnumeration(["hi"]) => "hi"
//   formatEnumeration(["apples", "oranges"]) => "apples and oranges"
//   formatEnumeration(["one", "two"], "or") => "one or two"
//   formatEnumeration(["one", "two", "four"]) => "one, two, and four"
export const formatEnumeration = (list: string[], joinWord = 'and') => {
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return list.join(` ${joinWord} `);
  const cutLast = list.slice(0, -1);
  return `${cutLast.join(', ')} ${joinWord} ${list.at(-1)}`;
};

/**
 * @param ds - string in date format (yyyy-mm-dd)
 * @returns date object in client timezone
 */
export const parseDateString = (ds: string): Date => {
  const [year, month, day] = ds.split('-');
  const now = new Date();
  now.setFullYear(parseInt(year, 10));
  now.setMonth(parseInt(month, 10) - 1);
  now.setDate(parseInt(day, 10));
  return now;
};

/**
 * @param word - word to capitalize
 * @returns capitalized word
 */
export const capitalize = (word: string): string =>
  `${word.at(0)?.toUpperCase()}${word.slice(1)}`;

// checks if value is null or undefined
export const nullOrUndefined = (x: unknown) => x === null || x === undefined;

// parses bool to int
export const boolToInt = (x: boolean) => (x ? 1 : 0);
