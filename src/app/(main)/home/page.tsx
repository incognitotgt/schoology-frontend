import { cookies } from "next/headers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Update from "@/components/update";
import { getSchoology } from "@/lib/schoology";

export default async function Index() {
	const schoology = await getSchoology();
	const userId = (await cookies()).get("userId")?.value;
	const { group: userGroups = [] }: { group: any[] } = await schoology(`/users/${userId}/groups`);
	const { section: userSections = [] }: { section: any[] } = await schoology(`/users/${userId}/sections`);
	const groupUpdatesList = await Promise.all(
		userGroups.map(async (group) => {
			const { update: updates = [] }: { update: any[] } = await schoology(`/groups/${group.id}/updates`);
			return updates.map((update) => ({
				...update,
				groupId: group.id,
				groupTitle: group.title,
			}));
		}),
	);
	const allGroupUpdates = groupUpdatesList
		.flat()
		.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
	const sectionUpdatesList = await Promise.all(
		userSections.map(async (section) => {
			const { update: updates = [] }: { update: any[] } = await schoology(`/sections/${section.id}/updates`);
			return updates.map((update) => ({
				...update,
				sectionId: section.id,
				sectionTitle: section.title,
			}));
		}),
	);
	const allSectionUpdates = sectionUpdatesList
		.flat()
		.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
	const userIds = [...new Set([...allGroupUpdates, ...allSectionUpdates].map((update) => update.uid))];

	// Fetch all user data in a single request
	const updateSenders =
		userIds.length > 0
			? (
					await schoology("/multiget", {
						method: "POST",
						contentType: "text/xml",
						body: `<?xml version="1.0" encoding="utf-8" ?><requests>${userIds.map(
							(uid: string) => `<request>/v1/users/${uid}</request>`,
						)}</requests>`,
					})
				).response.map((response: any) => response.body)
			: [];

	return (
		<main className="flex pt-6 items-center justify-center flex-col text-wrap">
			<Tabs defaultValue="course_updates" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="course_updates">Course Updates</TabsTrigger>
					<TabsTrigger value="group_updates">Other Updates</TabsTrigger>
					<TabsTrigger value="grades">Recent Grades</TabsTrigger>
				</TabsList>
				<TabsContent value="course_updates">
					{allSectionUpdates.length > 0 ? (
						allSectionUpdates.map((update) => (
							<Update
								key={update.id}
								updateSenders={updateSenders}
								update={update}
								id={update.sectionId}
								name={update.sectionTitle}
								path="/"
							/>
						))
					) : (
						<div className="p-4 text-center text-muted-foreground">No course updates available</div>
					)}
				</TabsContent>
				<TabsContent value="group_updates" className="flex flex-col gap-4">
					{allGroupUpdates.length > 0 ? (
						allGroupUpdates.map((update) => (
							<Update
								key={update.id}
								updateSenders={updateSenders}
								update={update}
								id={update.groupId}
								name={update.groupTitle}
								path="/"
							/>
						))
					) : (
						<div className="p-4 text-center text-muted-foreground">No group updates available</div>
					)}
				</TabsContent>
				<TabsContent value="grades">{/* Grades content will go here */}</TabsContent>
			</Tabs>
		</main>
	);
}
