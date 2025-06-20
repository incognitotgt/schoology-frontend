import { Heart, HeartOff } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { ClientDate } from "@/components/date";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchoology } from "@/lib/schoology";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const schoology = await getSchoology();
	const { id } = await params;
	const group = await schoology(`/groups/${id}`);
	const { update: updates }: { update: any[] } = await schoology(`/groups/${id}/updates`);
	const updateSenders: any[] = (
		await schoology("/multiget", {
			method: "POST",
			contentType: "text/xml",
			body: `<?xml version="1.0" encoding="utf-8" ?><requests>${updates.map(
				(update: any) => `<request>/v1/users/${update.uid}</request>`,
			)}</requests>`,
		})
	).response.map((response: any) => response.body);

	return (
		<main className="flex h-full flex-col text-wrap p-10 gap-2 mb-2">
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/groups">Groups</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{group.title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			{updates.map((update) => (
				<Card key={update.id} className="h-auto w-full flex flex-col justify-start">
					<CardHeader>
						<CardTitle className="truncate flex gap-2 items-center font-semibold">
							<Image
								src={
									updateSenders.find((val) => val?.id === update?.uid)?.picture_url ||
									"https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/images/user-default.svg"
								}
								alt="profile"
								width={170}
								height={170}
								className="rounded-full aspect-square bg-cover bg-center object-cover size-4 inline"
							/>
							{updateSenders.find((val) => val?.id === update.uid)?.name_display || update.uid}
						</CardTitle>
						<CardDescription>
							<ClientDate>{new Date(update.created * 1000).toLocaleString()}</ClientDate>
						</CardDescription>
					</CardHeader>
					<CardContent>{update.body}</CardContent>
					<CardFooter>
						<form
							action={async () => {
								"use server";
								const schoology = await getSchoology();
								await schoology(`/like/${update.id}`, {
									method: "POST",
									body: JSON.stringify({
										id,
										like_action: !update.user_like_action,
									}),
								});
								revalidatePath(`/groups/${id}`);
							}}
						>
							<Button variant={update.user_like_action ? "default" : "outline"} type="submit">
								{update.user_like_action ? <HeartOff className="size-6 mr-2" /> : <Heart className="size-6 mr-2" />}
								{update.likes}
							</Button>
						</form>
					</CardFooter>
				</Card>
			))}
		</main>
	);
}
