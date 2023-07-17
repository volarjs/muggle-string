import { describe, expect, it } from 'vitest';
import { replace, toString, segment } from '../out';

describe('replace', () => {

	it(`problems = 99 -> var answer = 42;`, () => {

		const s = [segment('problems = 99')];
		expect(toString(s)).toBe('problems = 99');

		replace(s, 'problems', 'answer');
		expect(toString(s)).toBe('answer = 99');

		replace(s, '99', '42');
		expect(toString(s)).toBe('answer = 42');

		s.unshift('var ');
		s.push(';');
		expect(toString(s)).toBe('var answer = 42;');
	});
});
