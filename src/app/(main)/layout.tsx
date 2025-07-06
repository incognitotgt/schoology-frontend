import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSchoology } from "@/lib/schoology";

export default async function Layout({ children }: { children: React.ReactNode }) {
	const schoology = await getSchoology();
	const user = await schoology(`/users/${(await cookies()).get("userId")?.value}`);
	const school = await schoology(`/schools/${user.building_id || user.school_id}`);
	return (
		<SidebarProvider>
			<AppSidebar user={user} school={school} />
			<main className="flex flex-col min-h-screen w-full p-4">{children}</main>
		</SidebarProvider>
	);
}
