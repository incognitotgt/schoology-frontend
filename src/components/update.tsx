import { Heart, HeartOff } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { ClientDate } from "@/components/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchoology } from "@/lib/schoology";
export default async function Update({
	update,
	updateSenders,
	id,
	name,
	path,
}: {
	update: any;
	updateSenders: any[];
	id: string;
	name?: string;
	path: string;
}) {
	return (
		<Card key={update.id} className="h-auto w-full flex flex-col justify-start">
			<CardHeader className="justify-start">
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
					{updateSenders.find((val) => val?.id === update.uid)?.name_display || update.uid}{" "}
				</CardTitle>
				<CardDescription className="flex flex-col gap-1">
					{name ? (
						<Button asChild variant="link" className="p-0 h-auto justify-start">
							<Link href={`/groups/${id}`}>{name}</Link>
						</Button>
					) : null}
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
						revalidatePath(path);
					}}
				>
					<Button variant={update.user_like_action ? "default" : "outline"} type="submit">
						{update.user_like_action ? <HeartOff className="size-6 mr-2" /> : <Heart className="size-6 mr-2" />}
						{update.likes}
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
}
