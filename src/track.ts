import { Segment, StackNode } from "./types";

let tracking = true;
let stackOffset = 0;

export function setTracking(value: boolean) {
	tracking = value;
}

export function offsetStack() {
	stackOffset++;
}

export function resetOffsetStack() {
	stackOffset--;
}

export function track<T extends Segment<any>[]>(segments: T): [T, StackNode[]] {
	const stacks: StackNode[] = [];

	return [
		new Proxy(segments, {
			get(target, prop, receiver) {
				if (tracking) {
					if (prop === 'push') return push;
					if (prop === 'pop') return pop;
					if (prop === 'shift') return shift;
					if (prop === 'unshift') return unshift;
					if (prop === 'splice') return splice;
					if (prop === 'sort') return sort;
					if (prop === 'reverse') return reverse;
				}
				return Reflect.get(target, prop, receiver);
			}
		}),
		stacks,
	];

	function push(...items: T) {
		stacks.push({ stack: getStack(), length: items.length });
		return segments.push(...items);
	}

	function pop() {
		if (stacks.length) {
			const last = stacks[stacks.length - 1];
			if (last.length > 1) {
				last.length--;
			}
			else {
				stacks.pop();
			}
		}
		return segments.pop();
	}

	function shift() {
		if (stacks.length) {
			const first = stacks[0];
			if (first.length > 1) {
				first.length--;
			}
			else {
				stacks.shift();
			}
		}
		return segments.shift();
	}

	function unshift(...items: T) {
		stacks.unshift({ stack: getStack(), length: items.length });
		return segments.unshift(...items);
	}

	function splice(start: number, deleteCount?: number, ...items: T) {
		if (deleteCount === undefined) {
			deleteCount = segments.length - start;
		}
		let remainDeleteCount = deleteCount;
		let stacksDeleteStart: number | undefined;
		let stacksDeleteLength = 0;
		let stackEnd = 0;
		for (let i = 0; i < stacks.length; i++) {
			const stack = stacks[i];
			const stackStart = stackEnd;
			stackEnd = stackStart + stack.length;
			while (start >= stackStart && start < stackEnd && remainDeleteCount && stack.length) {
				stack.length--;
				remainDeleteCount--;
				stackEnd--;
			}
			if (!stack.length) {
				stacksDeleteStart ??= i;
				stacksDeleteLength++;
			}
			if (remainDeleteCount <= 0) break;
		}
		if (stacksDeleteStart !== undefined) {
			stacks.splice(stacksDeleteStart, stacksDeleteLength);
		}
		return segments.splice(start, deleteCount, ...items);
	}

	function sort(compareFn?: ((a: Segment<any>, b: Segment<any>) => number) | undefined) {
		stacks.splice(0, stacks.length, { stack: getStack(), length: segments.length });
		return segments.sort(compareFn);
	}

	function reverse() {
		stacks.splice(0, stacks.length, { stack: getStack(), length: segments.length });
		return segments.reverse();
	}

	function getStack() {
		const stack = new Error().stack!;
		let source = stack.split('\n')[3 + stackOffset].trim();
		if (source.endsWith(')')) {
			source = source.slice(source.lastIndexOf('(') + 1, -1);
		}
		else {
			source = source.slice(source.lastIndexOf(' ') + 1);
		}
		return source;
	}
}
