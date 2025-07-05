"use client";

import {
	Bell,
	BookCheck,
	ChevronsUpDown,
	GraduationCap,
	Home,
	LogOut,
	Mail,
	MessagesSquare,
	Moon,
	Shapes,
	Sun,
} from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "@/actions/accounts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar";

interface Item {
	title: string;
	icon: React.ReactNode;
	href: string;
}
// biome-ignore lint: schoology can ema
export function AppSidebar({ school, user }: { school: any; user: any }) {
	const isMobile = useIsMobile();
	const { theme, themes, setTheme } = useTheme();
	return (
		<Sidebar>
			<SidebarHeader className="flex flex-row items-center px-4 pt-4 -pb-4 text-sidebar-primary">
				<GraduationCap className="size-5 shrink-0" />
				<h1 className="font-bold text-xl">{school?.title || "Schoology"}</h1>
			</SidebarHeader>
			<SidebarContent>
				<GroupComponent
					items={[
						{ title: "Home", icon: <Home />, href: "/home" },
						{ title: "Courses", icon: <Shapes />, href: "/courses" },
						{ title: "Groups", icon: <MessagesSquare />, href: "/groups" },
						{ title: "Grades", icon: <BookCheck />, href: "/grades" },
						{ title: "Messages", icon: <Mail />, href: "/messages" },
						{ title: "Notifications", icon: <Bell />, href: "/notifications" },
					]}
					title="Main"
				/>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											{...getImageProps({
												src: user.picture_url,
												width: 60,
												height: 60,
												alt: "Profile picture",
											}).props}
										/>
										<AvatarFallback className="rounded-lg">
											{user.name_first.charAt(0) + user.name_last.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{user.name_display}</span>
										<span className="truncate text-xs">{user.primary_email}</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side={isMobile ? "bottom" : "right"}
								align="end"
								sideOffset={4}
							>
								<DropdownMenuItem onClick={() => signOut()}>
									<LogOut />
									Sign Out
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setTheme(
											themes[
												themes.indexOf(theme as string) < themes.length - 1 ? themes.indexOf(theme as string) + 1 : 0
											],
										)
									}
								>
									<Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
									<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
									{theme?.charAt(0).toUpperCase()}
									{theme?.slice(1)}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

function GroupComponent({ items, title }: { items: Item[]; title: string }) {
	const pathname = usePathname();
	return (
		<SidebarGroup>
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
								<Link href={item.href}>
									{item.icon}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
