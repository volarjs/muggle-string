import { overwrite as _overwrite } from './base';
import { Range, Segment } from './types';

export function overwriteSource<T extends Segment<any>>(segments: T[], sourceLoc: number | Range, ...newSegments: T[]): T[];
export function overwriteSource<T extends Segment<any>>(segments: T[], source: string, sourceLoc: number | Range, ...newSegments: T[]): T[];
export function overwriteSource<T extends Segment<any>>(segments: T[], ...args: any[]) {
	let loc: number | Range;
	let newSegments: T[];
	if (typeof args[0] === 'string') {
		const source: string = args[0];
		const sourceLoc: number | Range = args[1];
		loc = typeof sourceLoc === 'number'
			? searchSource(segments, source, sourceLoc)
			: [searchSource(segments, source, sourceLoc[0]), searchSource(segments, source, sourceLoc[1])]
		newSegments = args.slice(2);
	}
	else {
		const sourceLoc: number | Range = args[0];
		loc = typeof sourceLoc === 'number'
			? searchSource(segments, sourceLoc)
			: [searchSource(segments, sourceLoc[0]), searchSource(segments, sourceLoc[1])]
		newSegments = args.slice(1);
	}
	return _overwrite(segments, loc, ...newSegments);
}

function searchSource<T extends Segment<any>>(segments: T[], sourceIndex: number): number;
function searchSource<T extends Segment<any>>(segments: T[], source: string, sourceTextIndex: number): number;
function searchSource<T extends Segment<any>>(segments: T[], ...args: any[]) {
	const source: string = args.length >= 2 ? args[0] : undefined;
	const sourceLoc: number = args.length >= 2 ? args[1] : args[0];
	let _offset = 0;
	let result: number | undefined;
	for (const segment of segments) {
		if (typeof segment === 'string') {
			_offset += segment.length;
			continue;
		}
		if (segment[1] === source) {
			const segmentStart = typeof segment[2] === 'number' ? segment[2] : segment[2][0];
			const segmentEnd = typeof segment[2] === 'number' ? segment[2] + segment[0].length : segment[2][1];
			if (sourceLoc >= segmentStart && sourceLoc <= segmentEnd) {
				result = _offset + (sourceLoc - segmentStart);
				break;
			}
		}
		_offset += segment[0].length;
	}
	if (result === undefined) {
		throw new Error(`Source index not found, source: ${source}, index: ${sourceLoc}`);
	}
	return result;
}
