import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSchoology } from "@/lib/schoology";

export default async function Page() {
	const schoology = await getSchoology();
	const messages = await schoology("/messages/inbox");
	const messageSenders: any[] = (
		await schoology("/multiget", {
			method: "POST",
			contentType: "text/xml",
			body: `<?xml version="1.0" encoding="utf-8" ?><requests>${messages.message.map(
				(message: any) => `<request>/v1/users/${message.author_id}</request>`,
			)}</requests>`,
		})
	).response.map((response: any) => response.body);
	return (
		<main className="flex h-full flex-col text-wrap mt-4 mx-12 pt-4 pb-1 gap-2">
			<div className="flex justify-start flex-col gap-2">
				<h1 className="text-4xl font-bold">Messages</h1>
				{messages.unread_count !== 0 ? <Badge>{messages.unread_count} unread</Badge> : null}
			</div>
			<div className="flex flex-col gap-2">
				{messages.message.map((message: any) => (
					<Link key={message.id} href={`/messages/inbox/${message.id}`}>
						<Card className="w-full h-16 hover:bg-secondary/70">
							<div className="flex justify-between items-center h-full px-6">
								<div className="flex items-center gap-4 flex-grow">
									<Image
										src={messageSenders.find((m) => message.author_id === m.id).picture_url}
										alt="profile"
										width={170}
										height={170}
										className="rounded-full aspect-square bg-cover bg-center object-cover size-8"
									/>
									<div className="flex gap-4 items-center">
										<span className="font-medium">
											{messageSenders.find((m) => message.author_id === m.id).name_display}
										</span>
										<span className="text-muted-foreground truncate">{message.subject}</span>
									</div>
								</div>
								<div className="text-muted-foreground text-sm whitespace-nowrap">
									{new Date(message.last_updated * 1000).toLocaleString()}
								</div>
							</div>
						</Card>
					</Link>
				))}
			</div>
		</main>
	);
}
