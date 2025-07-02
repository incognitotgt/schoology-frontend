import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Index() {
	return (
		<main className="flex pt-6 items-center justify-center flex-col text-wrap">
			<Tabs defaultValue="course_updates">
				<TabsList>
					<TabsTrigger value="course_updates">Course Updates</TabsTrigger>
					<TabsTrigger value="group_updates">Group Updates</TabsTrigger>
					<TabsTrigger value="grades">Recent Grades</TabsTrigger>
				</TabsList>
			</Tabs>
		</main>
	);
}
