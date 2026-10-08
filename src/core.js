/**
 * Core formatting logic for the Time Zone Offset Formatter.
 *
 * @module core
 */

/**
 * The maximum ISO 8601 extended offset magnitude in minutes: ±23:59.
 *
 * ISO 8601 bounds UTC offsets to a magnitude of 23 hours and 59 minutes.
 * Anything larger is out of scope and would produce a non-conformant string
 * such as "+24:00" (which is not a valid offset designator).
 */
export const MAX_ISO_OFFSET_MINUTES = 23 * 60 + 59;

/**
 * The largest absolute minute magnitude this formatter accepts.
 *
 * Kept distinct from MAX_ISO_OFFSET_MINUTES so the validate/format split is
 * unambiguous: validation enforces ISO 8601's hard limit, formatting trusts
 * its input.
 */
export const MAX_VALID_MINUTES = MAX_ISO_OFFSET_MINUTES;

/**
 * Formats a signed integer minute offset into the ISO 8601 extended
 * representation, e.g. `+08:00`, `-05:30`, `Z`.
 *
 * Decisions baked in (stated here so tests and callers agree):
 *
 * 1. **Input is an integer total-minutes offset** from UTC, where east of the
 *    prime meridian is positive and west is negative. This matches the sign
 *    convention used by ECMAScript's `Date.prototype.getTimezoneOffset` (after
 *    negation) and by most timezone databases.
 *
 * 2. **Sign is driven entirely by the input's sign.** A negative input yields
 *    a `-` prefix; zero or positive yields `+`. Zero is rendered as `+00:00`,
 *    never `Z`, because callers asked for a numeric offset string and
 *    `+00:00` is the unambiguous extended form. (See `formatZForZero` for the
 *    `Z` variant.)
 *
 * 3. **No fractional minutes.** The caller is responsible for rounding before
 *    calling. Passing `530.5` throws; it does not silently round.
 *
 * @param {number} totalMinutes - Signed integer offset in minutes.
 * @returns {string} ISO 8601 extended offset: `±HH:MM`.
 * @throws {TypeError} If `totalMinutes` is not a finite number.
 * @throws {TypeError} If `totalMinutes` is not an integer.
 * @throws {RangeError} If `|totalMinutes|` exceeds 23h59m.
 */
export function formatOffset(totalMinutes) {
  if (typeof totalMinutes !== 'number' || !Number.isFinite(totalMinutes)) {
    throw new TypeError(
      `formatOffset expected a finite number, got ${String(totalMinutes)}`
    );
  }
  if (!Number.isInteger(totalMinutes)) {
    throw new TypeError(
      `formatOffset expected an integer minute offset, got ${totalMinutes}`
    );
  }
  if (Math.abs(totalMinutes) > MAX_VALID_MINUTES) {
    throw new RangeError(
      `Offset ${totalMinutes} minutes exceeds the ISO 8601 maximum of ±${MAX_ISO_OFFSET_MINUTES}`
    );
  }

  const sign = totalMinutes < 0 ? '-' : '+';
  const magnitude = Math.abs(totalMinutes);
  const hours = Math.floor(magnitude / 60);
  const minutes = magnitude % 60;

  // String padStart is fine here, but manual character concat is simpler and
  // avoids any question of which build target supports padStart. Two digits,
  // known small values.
  const hh = hours < 10 ? `0${hours}` : String(hours);
  const mm = minutes < 10 ? `0${minutes}` : String(minutes);

  return `${sign}${hh}:${mm}`;
}

/**
 * Formats a signed integer minute offset into ISO 8601 extended form, using
 * `Z` when the offset is exactly zero.
 *
 * This matches the common shorthand where UTC itself is denoted `Z` (Zulu).
 * Non-zero offsets are formatted exactly as `formatOffset` would.
 *
 * @param {number} totalMinutes - Signed integer offset in minutes.
 * @returns {string} `Z` for zero, otherwise `±HH:MM`.
 * @throws {TypeError} If `totalMinutes` is not a finite integer.
 * @throws {RangeError} If `|totalMinutes|` exceeds the ISO 8601 maximum.
 */
export function formatOffsetZ(totalMinutes) {
  if (totalMinutes === 0) {
    return 'Z';
  }
  return formatOffset(totalMinutes);
}

/**
 * Validates that a value is a usable integer minute offset within ISO 8601's
 * range. Returns a boolean rather than throwing, for use in guard positions
 * where a thrown error would be inconvenient.
 *
 * @param {unknown} value - Anything.
 * @returns {boolean} True if `value` is a finite integer in [-1439, 1439].
 */
export function isValidOffset(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    Math.abs(value) <= MAX_VALID_MINUTES
  );
}
