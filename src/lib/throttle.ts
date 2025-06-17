function throttle<T extends (...args: unknown[]) => void>(delay: number, func: T): T {
	let lastCallTime = 0;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const throttledFunction = (...args: Parameters<T>): void => {
		const currentTime = performance.now();

		if (currentTime - lastCallTime >= delay) {
			lastCallTime = currentTime;

			func(...args);
		} else {
			if (!timeoutId) {
				timeoutId = setTimeout(
					() => {
						lastCallTime = performance.now();
						func(...args);
						timeoutId = null;
					},
					delay - (currentTime - lastCallTime),
				) as ReturnType<typeof setTimeout>;
			}
		}
	};

	return throttledFunction as T;
}

export { throttle };
