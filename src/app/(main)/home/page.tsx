import { getSchoology } from "@/lib/schoology";

export default async function Index() {
	const schoology = await getSchoology();
	const { school } = await schoology("/schools");
	return (
		<main className="flex h-full justify-center items-center flex-col text-wrap">
			<p>Your district/school is {school[0].title}</p>
		</main>
	);
}
