import { Segment, Range } from './types';

export function segment(text: string): Segment;
export function segment(text: string, start: number | Range): Segment;
export function segment<T>(text: string, start: number | Range, data: T): Segment<T>;
export function segment(text: string, source: string, start: number | Range): Segment;
export function segment<T>(text: string, source: string, start: number | Range, data: T): Segment<T>;
export function segment(...args: any[]): Segment<any> {
	const text: string = args[0];
	if (args.length === 1) {
		return text;
	}
	let source: string | undefined;
	let start: number;
	let end: number;
	let hasData = false;
	let data: {} | undefined;
	if (typeof args[1] !== 'number') {
		source = args[1];
		start = typeof args[2] == 'number' ? args[2] : args[2][0];
		end = typeof args[2] == 'number' ? args[2] + text.length : args[2][1];
		hasData = args.length >= 4;
		if (hasData) {
			data = args[3];
		}
	}
	else {
		start = typeof args[1] == 'number' ? args[1] : args[1][0];
		end = typeof args[1] == 'number' ? args[1] + text.length : args[1][1];
		hasData = args.length >= 3;
		if (hasData) {
			data = args[2];
		}
	}
	if (hasData) {
		return [text, source, [start, end], data];
	}
	else {
		return [text, source, [start, end]];
	}
}
