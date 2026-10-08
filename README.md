# Time Zone Offset Formatter

Formats a signed integer minute offset from UTC into the ISO 8601 extended form (`+08:00`, `-05:30`, `Z`).

```js
import { formatOffset, formatOffsetZ, isValidOffset } from './src/index.js';

formatOffset(480);    // "+08:00"
formatOffset(-300);   // "-05:00"
formatOffset(330);    // "+05:30"
formatOffset(0);      // "+00:00"
formatOffsetZ(0);     // "Z"
isValidOffset(480);   // true
isValidOffset(1500);  // false
```

## Why this exists

Converting a numeric UTC offset to an ISO 8601 string looks trivial until you hit the awkward cases: sign handling for zero and near-zero offsets, the 23h59m ceiling ISO 8601 imposes, fractional-minute inputs that must not be silently rounded, and `NaN`/`Infinity`/non-numeric input. This library makes one explicit decision for each of those and enforces it, so callers don't re-derive the rules.

The trade-off: input is **total minutes as a signed integer**, east-positive. If your source gives you seconds or hours, convert and round yourself before calling. The library will not guess.

## Edge cases you will hit

- **Zero is `+00:00` under `formatOffset`** and `Z` under `formatOffsetZ`. Pick the one matching your wire format; ISO 8601 permits both for UTC.
- **`-1` renders as `-00:01`, not `+00:01`.** Sign follows the input, so near-zero negative offsets keep their minus. This matters for historical/sub-hour offsets.
- **Fractional minutes throw** (`TypeError`), they are not rounded. Round before calling if your data has sub-minute precision.
- **Offsets beyond ±23:59 throw** (`RangeError`), per ISO 8601's hard limit on offset designators.
- **`NaN`, `Infinity`, strings, `null`, `undefined` throw** (`TypeError`). Use `isValidOffset` for a non-throwing guard.

## Exports

- `formatOffset(totalMinutes: number): string` — `±HH:MM`; zero is `+00:00`.
- `formatOffsetZ(totalMinutes: number): string` — `Z` for zero, otherwise `±HH:MM`.
- `isValidOffset(value: unknown): boolean` — true for finite integers in `[-1439, 1439]`.
- `MAX_ISO_OFFSET_MINUTES` — `1439`, the magnitude of `±23:59`.
- `MAX_VALID_MINUTES` — alias of `MAX_ISO_OFFSET_MINUTES`.

## Running the tests

```sh
node --test
```
