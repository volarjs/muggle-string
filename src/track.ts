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

export function track<T extends Segment<any>[]>(segments: T, stacks: StackNode[] = []): [T, StackNode[]] {
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
		let _stackStart = 0;
		let operateIndex: number | undefined;
		for (let i = 0; i < stacks.length; i++) {
			const stack = stacks[i];
			const stackStart = _stackStart;
			const stackEnd = stackStart + stack.length;
			_stackStart = stackEnd;
			if (start >= stackStart) {
				operateIndex = i + 1;
				const originalLength = stack.length;
				stack.length = start - stackStart;
				stacks.splice(operateIndex, 0, { stack: stack.stack, length: originalLength - stack.length });
				break;
			}
		}
		if (operateIndex === undefined) {
			throw new Error('Invalid splice operation');
		}
		let _deleteCount = deleteCount;
		for (let i = operateIndex; i < stacks.length; i++) {
			const stack = stacks[i];
			while (_deleteCount > 0 && stack.length > 0) {
				stack.length--;
				_deleteCount--;
			}
			if (_deleteCount === 0) {
				break;
			}
		}
		stacks.splice(operateIndex, 0, { stack: getStack(), length: items.length });
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
}

export function getStack() {
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
