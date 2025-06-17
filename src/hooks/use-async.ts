import { useEffect, useRef, useState } from "react";

interface Options {
	useCurrentData?: boolean;
}

type AsyncState<T> = {
	data: T | null;
	error: Error | null;
	loading: boolean;
};

const DEFAULT_OPTIONS: Options = {
	useCurrentData: false,
};

function useAsync<T>(initialData: T | null, options: Options = DEFAULT_OPTIONS) {
	const [state, setState] = useState<AsyncState<T>>({
		data: initialData,
		error: null,
		loading: false,
	});
	const latestData = useRef<T | null>(initialData);

	const run = async (promiseFn: () => Promise<T>) => {
		setState((prevState) => ({ ...prevState, loading: true }));
		try {
			const data = await promiseFn();
			latestData.current = data;
			setState({ data, error: null, loading: false });
			return data;
		} catch (error) {
			setState(
				(prevState) =>
					({
						...prevState,
						error,
						loading: false,
						data: null,
					}) as AsyncState<T>,
			);
			console.error(error); // Handle or log the error appropriately
			return null;
		}
	};

	useEffect(() => {
		if (options.useCurrentData && latestData.current !== null) {
			setState((prevState) => ({ ...prevState, data: latestData.current }));
		}
	}, [options.useCurrentData]);

	return {
		...state,
		run,
	};
}

export default useAsync;
