import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Update from "@/components/update";
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
				<Update key={update.id} updateSenders={updateSenders} update={update} id={id} />
			))}
		</main>
	);
}
