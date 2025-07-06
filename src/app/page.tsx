import { ShieldX } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/accounts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSchoology } from "@/lib/schoology";
import type { Credentials } from "@/types/cookies";

export default async function Index({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { error } = await searchParams;
	const creds = (await cookies()).get("credentials")?.value;
	if (creds) {
		const parsedCreds: Credentials = JSON.parse(creds);
		if (parsedCreds.cKey && parsedCreds.cSecret) redirect("/home");
	}
	return (
		<main className="flex h-full justify-center items-center">
			<Card className="flex h-96 w-84 flex-col">
				<CardHeader>
					<CardTitle className="text-2xl">Login with API key</CardTitle>
					<CardDescription>API keys are normally on {"<schoology domain>/api"}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					{error ? (
						<Alert variant="destructive" className="w-full text-destructive">
							<ShieldX className="h-4 w-4" />
							<AlertTitle>Error logging in:</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}
					<form
						className="flex flex-col gap-2 w-full"
						action={async (data: FormData) => {
							"use server";
							const cKey = data.get("cKey")?.toString();
							const cSecret = data.get("cSecret")?.toString();
							if (cKey && cSecret) {
								const cookiesList = await cookies();
								cookiesList.set("credentials", JSON.stringify({ cKey, cSecret } as Credentials));
								const schoology = await getSchoology();
								const req = await schoology("/app-user-info");
								if (req.error) {
									return signOut(undefined, req.error);
								}
								cookiesList.set("userId", req.api_uid);
								return redirect("/home");
							}
						}}
					>
						<Label htmlFor="cKey">Consumer key</Label>
						<Input name="cKey" id="cKey" type="text" placeholder="xxxxxxxxxx" required />
						<Label htmlFor="cSecret">Consumer secret</Label>
						<Input name="cSecret" id="cSecret" type="password" placeholder="***********" required />
						<Button type="submit">Save and Login</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
