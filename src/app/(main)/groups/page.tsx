import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchoology } from "@/lib/schoology";

export default async function Page() {
	const schoology = await getSchoology();
	const { group }: { group: any[] } = await schoology(`/users/${(await cookies()).get("userId")?.value}/groups`);
	return (
		<main className="flex h-full flex-col text-wrap">
			<section className="flex justify-start mt-4 ml-12 pt-4 pb-1">
				<h1 className="text-4xl font-bold">Groups</h1>
			</section>
			<section className=" grid-rows-subgrid gap-4 3xl:grid-cols-6 4xl:grid-cols-7 grid place-content-center place-items-center p-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{group.map((group: any) => (
					<Link key={group.id} href={`/groups/${group.id}`}>
						<Card className="h-64 w-72 flex flex-col justify-center hover:bg-secondary/70">
							<CardHeader>
								<CardTitle className="truncate">{group.title}</CardTitle>
								<CardDescription>{group.section_title}</CardDescription>
								<CardDescription className="truncate">{group.description}</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col items-center justify-start">
								<Image
									src={group.picture_url}
									alt="profile"
									width={750}
									height={375}
									className="rounded-sm w-56 h-28 bg-cover bg-center aspect-video object-cover"
								/>
							</CardContent>
						</Card>
					</Link>
				))}
			</section>
		</main>
	);
}
