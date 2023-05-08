declare const NO_DATA_SYMBOL: unique symbol;

export type Segment<T = typeof NO_DATA_SYMBOL> = string | (
	T extends typeof NO_DATA_SYMBOL ?
	// text, source, source range / offset
	[string, string | undefined, number | [number, number]] :
	// text, source, source range / offset, data
	[string, string | undefined, number | [number, number], T]
);

export interface StackNode {
	length: number;
	stack: string;
}
