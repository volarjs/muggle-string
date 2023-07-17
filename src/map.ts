import { SourceMapLine, encode } from '@jridgewell/sourcemap-codec';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getLength, overwrite, toString } from './base';
import { Segment } from './types';

export function clone(segments: Segment<any>[]) {
	const cloned: Segment<any>[] = [];
	for (const s of segments) {
		if (typeof s === 'string') {
			cloned.push(s);
		}
		else {
			cloned.push([...s]);
		}
	}
	return cloned;
}

export function generateMap(
	segments: Segment<any>[],
	readSource: (source?: string) => [number, string]
): string {

	const cloned = clone(segments);
	const mappings: SourceMapLine[] = [];
	const sourceCode = new Map<string | undefined, [number, TextDocument]>();

	let newLineIndex = toString(cloned).indexOf('\n');

	while (newLineIndex >= 0) {
		onLine(overwrite(cloned, [0, newLineIndex + 1]));
		newLineIndex = toString(cloned).indexOf('\n');
	}

	onLine(overwrite(cloned, [0, getLength(cloned)]));

	return encode(mappings);

	function onLine(lineSegments: Segment<any>[]) {
		const lineMapping: SourceMapLine = [];
		let currentColumn = 0;
		let hasCodeMapping = false;
		for (const s of lineSegments) {
			if (typeof s === 'string') {

				if (hasCodeMapping) {
					hasCodeMapping = false;
					// we don't break off last mapping for now
				}

				currentColumn += s.length;
			}
			else {
				hasCodeMapping = true;

				const source = s[1];
				const sourceOffset = s[2][0];
				if (!sourceCode.has(source)) {
					const readed = readSource(source);
					sourceCode.set(source, [readed[0], TextDocument.create('', '', 0, readed[1])]);
				}
				const [sourceIndex, document] = sourceCode.get(source)!;
				const position = document.positionAt(sourceOffset);
				lineMapping.push([
					currentColumn,
					sourceIndex,
					position.line,
					position.character,
				]);

				currentColumn += s[0].length;
			}
		}
		mappings.push(lineMapping);
	}
}
