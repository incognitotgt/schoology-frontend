import { LoaderPinwheel } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex justify-center flex-col items-center h-screen">
			<LoaderPinwheel className="animate-spin" />
		</div>
	);
}
