import { binarySearch } from './binarySearch';
import { offsetStack, resetOffsetStack } from './track';
import { Range, Segment } from './types';

export function getLength(segments: Segment<any>[]) {
	let length = 0;
	for (const segment of segments) {
		length += typeof segment == 'string' ? segment.length : segment[0].length;
	}
	return length;
}

export function toString<T extends Segment<any>>(segments: T[]) {
	return segments.map(s => typeof s === 'string' ? s : s[0]).join('');
}

export function replace<T extends Segment<any>>(segments: T[], pattern: string | RegExp, ...replacers: (T | ((match: string) => T))[]) {
	const str = toString(segments);
	const match = str.match(pattern);
	if (match && match.index !== undefined) {
		const start = match.index;
		const end = start + match[0].length;
		offsetStack();
		overwrite(segments, [start, end], ...replacers.map(replacer => typeof replacer === 'function' ? replacer(match[0]) : replacer));
		resetOffsetStack();
	}
}

export function replaceAll<T extends Segment<any>>(segments: T[], pattern: RegExp, ...replacers: (T | ((match: string) => T))[]) {
	const str = toString(segments);
	const allMatch = str.matchAll(pattern);
	let length = str.length;
	let lengthDiff = 0;
	for (const match of allMatch) {
		if (match.index !== undefined) {
			const start = match.index + lengthDiff;
			const end = start + match[0].length;
			offsetStack();
			overwrite(segments, [start, end], ...replacers.map(replacer => typeof replacer === 'function' ? replacer(match[0]) : replacer));
			resetOffsetStack();
			const newLength = getLength(segments);
			lengthDiff += newLength - length;
			length = newLength;
		}
	}
}

export function overwrite<T extends Segment<any>>(segments: T[], range: number | Range, ...inserts: T[]): T[] {
	const offsets = toOffsets(segments);
	const [start, end] = typeof range === 'number' ? [range, range] : range;
	const startIndex = binarySearch(offsets, start);
	const endIndex = binarySearch(offsets, end);
	const startSegment = segments[startIndex];
	const endSegment = segments[endIndex];
	const startSegmentStart = offsets[startIndex];
	const endSegmentStart = offsets[endIndex];
	const endSegmentEnd = offsets[endIndex] + (typeof endSegment === 'string' ? endSegment.length : endSegment[0].length);
	if (start > startSegmentStart) {
		inserts.unshift(trimSegmentEnd(startSegment, start - startSegmentStart));
	}
	if (end < endSegmentEnd) {
		inserts.push(trimSegmentStart(endSegment, end - endSegmentStart));
	}
	offsetStack();
	const deleted = segments.splice(startIndex, endIndex - startIndex + 1, ...inserts);
	resetOffsetStack();
	if (end < endSegmentEnd) {
		deleted[deleted.length - 1] = trimSegmentEnd(deleted[deleted.length - 1], end - endSegmentStart);
	}
	if (start > startSegmentStart) {
		deleted[0] = trimSegmentStart(deleted[0], start - startSegmentStart);
	}
	return deleted;
}

function trimSegmentEnd<T extends Segment<any>>(segment: T, trimEnd: number) {
	if (typeof segment === 'string') {
		return segment.slice(0, trimEnd) as T;
	}
	const originalString = segment[0];
	const originalRange = segment[2];
	const newString = originalString.slice(0, trimEnd);
	const newRange = typeof originalRange === 'number' ? originalRange : [originalRange[0], originalRange[1] - (originalString.length - newString.length)];
	return [
		newString,
		segment[1],
		newRange,
		...segment.slice(3),
	] as T;
}

function trimSegmentStart<T extends Segment<any>>(segment: T, trimStart: number) {
	if (typeof segment === 'string') {
		return segment.slice(trimStart) as T;
	}
	const originalString = segment[0];
	const originalRange = segment[2];
	const newString = originalString.slice(trimStart);
	if (trimStart < 0) {
		trimStart += originalString.length;
	}
	const newRange = typeof originalRange === 'number' ? originalRange + trimStart : [originalRange[0] + trimStart, originalRange[1]];
	return [
		newString,
		segment[1],
		newRange,
		...segment.slice(3),
	] as T;
}

function toOffsets(segments: Segment<any>[]) {
	const offsets: number[] = [];
	let offset = 0;
	for (const segment of segments) {
		offsets.push(offset);
		offset += typeof segment == 'string' ? segment.length : segment[0].length;
	}
	return offsets;
}
