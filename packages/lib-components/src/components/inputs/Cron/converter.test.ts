import { convertToRanges } from './converter';
import { expect, it, describe } from 'vitest';

describe('convertToRanges', () => {
  it('Should convert consecutive numbers to ranges', () => {
    let result1 = convertToRanges(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
    expect(result1).toBe('1-10');
  });

  it('Should convert non-consecutive numbers to ranges', () => {
    let result2 = convertToRanges(['9', '10', '11', '12', '14', '15', '16']);
    expect(result2).toBe('9-12,14-16');
  });

  it('Should join non-consecutive numbers by `,`', () => {
    let result3 = convertToRanges(['1', '3', '5', '7', '9']);
    expect(result3).toBe('1,3,5,7,9');
  });
});
