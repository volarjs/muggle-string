export declare const NO_DATA_SYMBOL: unique symbol;

export type Range = [number, number];

export type Segment<T = typeof NO_DATA_SYMBOL> = string | (
	T extends typeof NO_DATA_SYMBOL
	? [text: string, source: string | undefined, sourceRange: Range]
	: [text: string, source: string | undefined, sourceRange: Range, data: T]
);

export interface StackNode {
	length: number;
	stack: string;
}
