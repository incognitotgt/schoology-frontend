import type { NextRequest } from "next/server";
import { getSchoology } from "@/lib/schoology";

type Props = { params: Promise<{ slug: string[] }> };
export const GET = async (req: NextRequest, { params }: Props) =>
	(await getSchoology())(`/${(await params).slug.join("/")}?${req.nextUrl.searchParams.toString()}`, {
		returns: "response",
		method: "GET",
		disableCompression: true,
	});
export const POST = async (req: NextRequest, { params }: Props) =>
	(await getSchoology())(`/${(await params).slug.join("/")}?${req.nextUrl.searchParams.toString()}`, {
		returns: "response",
		method: "POST",
		body: req.body,
		disableCompression: true,
	});
