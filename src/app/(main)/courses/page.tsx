import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchoology } from "@/lib/schoology";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
	const schoology = await getSchoology();
	const { archived } = await searchParams;
	const { section }: { section: any[] } = await schoology(
		`/users/${(await cookies()).get("userId")?.value}/sections${archived === "true" && "?include_past=1"}`,
	);
	return (
		<main className="flex h-full flex-col text-wrap">
			<section className="flex justify-start mt-4 ml-12 pt-4 pb-1 flex-col">
				<h1 className="text-4xl font-bold">Courses</h1>
				{archived ? (
					<div className="flex flex-row items-center gap-0">
						<p className="text-sm text-muted-foreground">Showing archived courses</p>
						<Button variant="link" asChild>
							<Link href="/courses">Go back</Link>
						</Button>
					</div>
				) : (
					<div className="flex flex-row items-center gap-0">
						<p className="text-sm text-muted-foreground">Showing active courses</p>
						<Button variant="link" asChild>
							<Link href="/courses?archived=true">Show archived</Link>
						</Button>
					</div>
				)}
			</section>
			{section?.length > 0 ? (
				<section className="grid-rows-subgrid gap-4 3xl:grid-cols-6 4xl:grid-cols-7 grid place-content-center place-items-center p-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{section.map((section: any) => (
						<Link key={section.id} href={`/courses/${section.id}`}>
							<Card className="h-64 w-72 flex flex-col justify-center hover:bg-secondary/70	">
								<CardHeader>
									<CardTitle className="truncate">{section.course_title}</CardTitle>
									<CardDescription>{section.section_title}</CardDescription>
									<CardDescription className="truncate">{section.description}</CardDescription>
								</CardHeader>
								<CardContent className=" flex flex-col items-center justify-start">
									<Image
										src={section.profile_url}
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
			) : (
				<section className="flex flex-col items-center justify-center h-full">
					<h2 className="text-2xl font-bold">No courses found :(</h2>
				</section>
			)}
		</main>
	);
}
