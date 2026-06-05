/**
 * Round a number to exactly 2 decimal places.
 * Use on every monetary computation before persisting to DB.
 *
 * IMPORTANT: pg driver returns decimal/numeric columns as JS strings.
 * Always parseFloat() before arithmetic, then round2() before write.
 */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Parse a value that may come back as a string from the pg driver
 * (TypeORM returns decimal columns as strings).
 */
export const toNumber = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
};
