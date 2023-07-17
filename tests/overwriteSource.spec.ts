import { describe, expect, it } from 'vitest';
import { overwriteSource, toString, segment } from '../out';

describe('replace source range', () => {

	it(`problems = 99 -> var answer = 42;`, () => {

		const s = [segment('problems = 99', 0)];

		overwriteSource(s, [0, 8], 'answer');
		expect(s).toEqual([
			'answer',
			segment(' = 99', 8),
		]);

		overwriteSource(s, [11, 13], '42');
		expect(s).toEqual([
			'answer',
			segment(' = ', 8),
			'42',
		]);

		s.unshift('var ');
		s.push(';');

		expect(s).toEqual([
			'var ',
			'answer',
			segment(' = ', 8),
			'42',
			';',
		]);
		expect(toString(s)).toBe('var answer = 42;');
	});

	it(`problems = 99 (fail replaces)`, () => {

		const s = [segment('problems = 99', 0)];

		// final
		overwriteSource(s, [1, 12]);
		expect(s).toEqual([
			segment('p', 0),
			segment('9', 12),
		]);
		expect(toString(s)).toBe('p9');
	});
});
