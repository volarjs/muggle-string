import { describe, expect, it } from 'vitest';
import { overwrite, toString, segment } from '../out';
import { generateMap } from '../out/map';

describe('overwrite', () => {

	it(`problems = 99 -> var answer = 42;`, () => {

		const s = [segment('problems = 99')];
		expect(toString(s)).toBe('problems = 99');

		let d = overwrite(s, [0, 8], 'answer');
		expect(toString(s)).toBe('answer = 99');
		expect(toString(d)).toBe('problems');

		d = overwrite(s, [9, 11], '42');
		expect(toString(s)).toBe('answer = 42');
		expect(toString(d)).toBe('99');

		s.unshift('var ');
		s.push(';');
		expect(toString(s)).toBe('var answer = 42;');
	});

	it(`problems = 99 -> problems - 99`, () => {

		const s = [segment('problems = 99')];
		expect(toString(s)).toBe('problems = 99');

		let d = overwrite(s, [9, 10], '-');
		expect(toString(s)).toBe('problems - 99');
		expect(toString(d)).toBe('=');
	});

	it(`problems = 99 -> problems+99`, () => {

		const s = [segment('problems = 99')];
		expect(toString(s)).toBe('problems = 99');

		let d = overwrite(s, [9, 10], segment('-', 123));
		expect(s).toEqual(['problems ', segment('-', 123), ' 99']);
		expect(toString(s)).toBe('problems - 99');
		expect(toString(d)).toBe('=');

		d = overwrite(s, [8, 11], segment('+', 123));
		expect(s).toEqual(['problems', segment('+', 123), '99']);
		expect(toString(s)).toBe('problems+99');
		expect(toString(d)).toBe(' - ');
	});

	it(`problems = 99 -> var answer = 42; (with mapping)`, () => {

		const s = [segment('problems = 99', 0)];
		expect(s).toEqual([segment('problems = 99', 0)]);
		expect(toString(s)).toBe('problems = 99');

		let d = overwrite(s, [0, 8], 'answer');
		expect(s).toEqual(['answer', segment(' = 99', 8)]);
		expect(toString(s)).toBe('answer = 99');
		expect(toString(d)).toBe('problems');

		d = overwrite(s, [9, 11], '42');
		expect(s).toEqual(['answer', segment(' = ', 8), '42']);
		expect(toString(s)).toBe('answer = 42');
		expect(toString(d)).toBe('99');
	});

	it(`problems = 99 -> problems+99 (with mapping)`, () => {

		const s = [segment('problems = 99', 0)];
		expect(s).toEqual([segment('problems = 99', 0)]);
		expect(toString(s)).toBe('problems = 99');

		let d = overwrite(s, [9, 10], segment('-', 123));
		expect(s).toEqual([segment('problems ', 0), segment('-', 123), segment(' 99', 10)]);
		expect(toString(s)).toBe('problems - 99');
		expect(toString(d)).toBe('=');

		d = overwrite(s, [8, 11], segment('+', 123));
		expect(s).toEqual([segment('problems', 0), segment('+', 123), segment('99', 11)]);
		expect(toString(s)).toBe('problems+99');
		expect(toString(d)).toBe(' - ');
	});
});
