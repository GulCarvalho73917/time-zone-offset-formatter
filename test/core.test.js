import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatOffset,
  formatOffsetZ,
  isValidOffset,
  MAX_ISO_OFFSET_MINUTES,
  MAX_VALID_MINUTES,
} from '../src/index.js';

describe('formatOffset', () => {
  it('formats a positive whole-hour offset', () => {
    assert.equal(formatOffset(480), '+08:00');
  });

  it('formats a negative whole-hour offset', () => {
    assert.equal(formatOffset(-300), '-05:00');
  });

  it('formats a positive half-hour offset', () => {
    assert.equal(formatOffset(330), '+05:30');
  });

  it('formats a negative half-hour offset', () => {
    assert.equal(formatOffset(-210), '-03:30');
  });

  it('formats a 45-minute offset', () => {
    assert.equal(formatOffset(345), '+05:45');
  });

  it('formats zero as +00:00, not Z', () => {
    assert.equal(formatOffset(0), '+00:00');
  });

  it('formats +00:01 and -00:01 to preserve sign', () => {
    assert.equal(formatOffset(1), '+00:01');
    assert.equal(formatOffset(-1), '-00:01');
  });

  it('formats the ISO 8601 maximum positive boundary (+23:59)', () => {
    assert.equal(formatOffset(MAX_ISO_OFFSET_MINUTES), '+23:59');
  });

  it('formats the ISO 8601 maximum negative boundary (-23:59)', () => {
    assert.equal(formatOffset(-MAX_ISO_OFFSET_MINUTES), '-23:59');
  });

  it('throws TypeError on non-number input', () => {
    assert.throws(() => formatOffset('480'), TypeError);
    assert.throws(() => formatOffset(null), TypeError);
    assert.throws(() => formatOffset(undefined), TypeError);
  });

  it('throws TypeError on NaN', () => {
    assert.throws(() => formatOffset(NaN), TypeError);
  });

  it('throws TypeError on Infinity', () => {
    assert.throws(() => formatOffset(Infinity), TypeError);
    assert.throws(() => formatOffset(-Infinity), TypeError);
  });

  it('throws TypeError on fractional minutes', () => {
    assert.throws(() => formatOffset(530.5), TypeError);
    assert.throws(() => formatOffset(-530.5), TypeError);
  });

  it('throws RangeError when offset exceeds the ISO 8601 maximum', () => {
    assert.throws(() => formatOffset(MAX_ISO_OFFSET_MINUTES + 1), RangeError);
    assert.throws(
      () => formatOffset(-(MAX_ISO_OFFSET_MINUTES + 1)),
      RangeError
    );
  });
});

describe('formatOffsetZ', () => {
  it('returns Z for zero', () => {
    assert.equal(formatOffsetZ(0), 'Z');
  });

  it('delegates to formatOffset for non-zero positive', () => {
    assert.equal(formatOffsetZ(480), '+08:00');
  });

  it('delegates to formatOffset for non-zero negative', () => {
    assert.equal(formatOffsetZ(-300), '-05:00');
  });

  it('still validates input on zero check path', () => {
    // The zero check happens before validation, but non-number zero is not === 0,
    // so it falls through to formatOffset, which throws TypeError.
    assert.throws(() => formatOffsetZ(NaN), TypeError);
    assert.throws(() => formatOffsetZ('0'), TypeError);
  });

  it('still enforces range on non-zero values', () => {
    assert.throws(() => formatOffsetZ(MAX_ISO_OFFSET_MINUTES + 1), RangeError);
  });
});

describe('isValidOffset', () => {
  it('accepts valid integers within range', () => {
    assert.equal(isValidOffset(0), true);
    assert.equal(isValidOffset(480), true);
    assert.equal(isValidOffset(-300), true);
    assert.equal(isValidOffset(MAX_VALID_MINUTES), true);
    assert.equal(isValidOffset(-MAX_VALID_MINUTES), true);
  });

  it('rejects out-of-range integers', () => {
    assert.equal(isValidOffset(MAX_VALID_MINUTES + 1), false);
    assert.equal(isValidOffset(-(MAX_VALID_MINUTES + 1)), false);
  });

  it('rejects non-integers', () => {
    assert.equal(isValidOffset(530.5), false);
    assert.equal(isValidOffset(-530.5), false);
  });

  it('rejects non-numbers', () => {
    assert.equal(isValidOffset('480'), false);
    assert.equal(isValidOffset(null), false);
    assert.equal(isValidOffset(undefined), false);
    assert.equal(isValidOffset(NaN), false);
    assert.equal(isValidOffset(Infinity), false);
  });
});

describe('constants', () => {
  it('exposes MAX_ISO_OFFSET_MINUTES as 1439', () => {
    assert.equal(MAX_ISO_OFFSET_MINUTES, 1439);
    assert.equal(MAX_VALID_MINUTES, 1439);
  });
});
