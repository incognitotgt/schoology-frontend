"use client";

import { GraduationCap } from "lucide-react";
import { signOut } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="flex h-full flex-col items-center justify-center">
			<div className="flex h-[32rem] w-96 flex-col items-center justify-center gap-4">
				<div className="mb-4 flex items-center justify-center text-left text-2xl font-bold">
					<GraduationCap />
					<span className="ml-2 text-2xl font-bold">Schoology</span>
				</div>
				<p className="text-center text-6xl font-bold text-primary">Error</p>
				<div className="flex flex-col items-center justify-center gap-4">
					<p className="text-center">Schoology has encountered an error</p>
					<p className="text-center">Digest: {error.digest ?? "none"}</p>
					{error.message ? (
						<code className="text-center text-lg font-bold text-destructive">{error.message}</code>
					) : null}
					<Button className="text-center" onClick={reset}>
						Reset
					</Button>
					<Button variant="destructive" className="text-center" onClick={() => signOut()}>
						Sign Out
					</Button>
					<p className="text-xs text-muted-foreground">More details are in the logs</p>
				</div>
			</div>
		</div>
	);
}
