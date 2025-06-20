import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OAuth from "oauth-1.0a";
import type { Credentials } from "@/types/cookies";

const caughtRedirect = (...params: Parameters<typeof redirect>) => {
	try {
		redirect(...params);
	} catch {}
	// we <3 typescript
	return undefined as never;
};
/**
 * @param contentType Content type of the request
 * @param returns Type of response to return
 * @param disableCompression Disable compression for the request
 **/
export type SchoologyRequestInit = Omit<RequestInit, "headers"> & {
	contentType?: string | undefined;
	returns?: "json" | "text" | "blob" | "arrayBuffer" | "formData" | "response";
	disableCompression?: boolean;
};
/**
 * @param path Request path
 * @param options Request options
 * @returns The response from the API
 */
// biome-ignore lint/suspicious/noExplicitAny: there arent any types
export type SchoologyInstance = (path: string, options?: SchoologyRequestInit | undefined) => Promise<any>;
export async function getSchoology(): Promise<SchoologyInstance> {
	const authCookie = (await cookies()).get("credentials");
	if (!authCookie) return caughtRedirect("/");
	const { cKey, cSecret }: Credentials = JSON.parse(authCookie.value);
	if (!cKey || !cSecret) return caughtRedirect("/");
	const oauth = new OAuth({
		consumer: { key: cKey, secret: cSecret },
		signature_method: "PLAINTEXT",
		realm: "Schoology API",
		hash_function: (_base_string, key) => key,
	});
	return async (
		path: string,
		{ contentType, returns, disableCompression = false, ...options }: SchoologyRequestInit | undefined = {},
	) => {
		const responseOpts = (): RequestInit => ({
			...options,
			headers: {
				"Content-Type": contentType || "application/json",
				Accept: "application/json",
				...(disableCompression ? { "Accept-Encoding": "identity" } : {}),
				...oauth.toHeader(oauth.authorize({ url: "https://api.schoology.com", method: "GET" })),
			},
		});
		let res = await fetch(`https://api.schoology.com/v1${path}`, responseOpts());
		if (res.status === 429) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			res = await fetch(`https://api.schoology.com/v1${path}`, responseOpts());
		}
		if ([401, 403].includes(res.status)) {
			return { error: await res.text() };
		}
		if (returns === "response") {
			return res as Response;
		}
		return res[returns || "json"]();
	};
}
