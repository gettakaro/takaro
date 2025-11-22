import { Duration } from 'luxon';
import { describe, it, expect } from 'vitest';

describe('DurationField - Luxon year conversion bug', () => {
  it('should correctly round-trip 20 years through milliseconds without rescale drift', () => {
    const originalYears = 20;
    const millis = Duration.fromObject({ years: originalYears }).toMillis();
    const rescaled = Duration.fromMillis(millis).rescale().toObject();

    expect(rescaled).toEqual({ years: originalYears });
  });
});
