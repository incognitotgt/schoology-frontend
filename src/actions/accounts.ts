"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut(_data?: FormData | undefined, error?: string) {
	const cookiesList = await cookies();
	cookiesList.delete("credentials");
	cookiesList.delete("userId");
	redirect(`/${error ? `?error=${error}` : ""}`);
}
