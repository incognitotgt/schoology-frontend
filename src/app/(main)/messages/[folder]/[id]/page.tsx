import { md5 } from "js-md5";
import { DownloadIcon, FileIcon, Link, Send, TrashIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { ClientDate } from "@/components/date";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getSchoology } from "@/lib/schoology";
export default async function Page({ params }: { params: Promise<{ id: string; folder: string }> }) {
	const schoology = await getSchoology();
	const { id, folder } = await params;
	const { message: messages }: { message: any[] } = await schoology(
		`/messages/${folder}/${id}?with_attachments=TRUE`,
	).catch(notFound);
	const messageRecipients: any[] = (
		await schoology("/multiget", {
			method: "POST",
			contentType: "text/xml",
			body: `<?xml version="1.0" encoding="utf-8" ?><requests>${messages[0].recipient_ids
				.split(",")
				.map((recipient: number) => `<request>/v1/users/${recipient}</request>`)}</requests>`,
		}).catch(notFound)
	).response.map((response: any) => response.body);
	return (
		<main className="flex h-full flex-col text-wrap items-center py-4 mb-2">
			<Card className="h-auto w-[80%] flex flex-col justify-center">
				<CardHeader className="flex flex-row justify-between items-center">
					<div className="gap-1 flex flex-col truncate">
						<CardTitle className="truncate">{messages[0].subject}</CardTitle>
						<CardDescription>
							Recipients: {messageRecipients.map((recipient) => decodeURIComponent(recipient.name_display)).join(", ")}
						</CardDescription>
					</div>
					<div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<TrashIcon className="size-5 mr-2" />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<form
									action={async () => {
										"use server";
										const schoology = await getSchoology();
										await schoology(`/messages/${folder}/${id}`, {
											method: "DELETE",
											returns: "response",
										});
										redirect("/home");
									}}
								>
									<AlertDialogHeader>
										<AlertDialogTitle>Delete Message</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to delete this message? Deleting does NOT unsend the message.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel asChild>
											<Button variant="ghost">Cancel</Button>
										</AlertDialogCancel>
										<AlertDialogAction type="submit">Delete</AlertDialogAction>
									</AlertDialogFooter>
								</form>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-start gap-2">
					{messages.map((message, index) => (
						<Fragment key={message.message}>
							<div className="h-auto w-full flex flex-col justify-start">
								<CardHeader>
									<div className="truncate flex gap-2 items-center font-semibold">
										<Image
											src={messageRecipients.find((val) => val.id === message.author_id).picture_url}
											alt="profile"
											width={170}
											height={170}
											className="rounded-full aspect-square bg-cover bg-center object-cover size-4 inline"
										/>
										{messageRecipients.find((val) => val.id === message.author_id).name_display}
									</div>
									<CardDescription>
										<ClientDate>{new Date(message.last_updated * 1000).toLocaleString()}</ClientDate>
									</CardDescription>
								</CardHeader>
								<CardContent>{message.message}</CardContent>
								{message.attachments ? (
									<CardFooter className="gap-2">
										{message.attachments.links?.link.map((link: any) => (
											<a key={link.id} href={link.url} target="_blank" rel="noreferrer">
												<Card key={link.id} className="hover:bg-secondary/70">
													<CardHeader>
														<CardTitle className="truncate flex gap-2 items-center">
															<Link className="size-5 flex-shrink-0 inline" />
															{link.title}
														</CardTitle>
														<CardDescription>{link.url}</CardDescription>
													</CardHeader>
												</Card>
											</a>
										))}
										{message.attachments.files?.file
											? message.attachments.files.file.map((file: any) => (
													<Card key={file.id} className="flex justify-start items-center p-4 h-16 w-auto gap-4">
														<FileIcon className="size-5 flex-shrink-0" />
														<span className="text-sm truncate overflow-x-scroll">{file.filename}</span>
														<Button size="icon" className="flex-shrink-0" asChild>
															<a download={file.filename} href={`/api${file.download_path.split("v1")[1]}`}>
																<DownloadIcon className="size-4" />
															</a>
														</Button>
													</Card>
												))
											: null}
									</CardFooter>
								) : null}
							</div>
							{index >= 0 && index !== messages.length - 1 ? <Separator /> : null}
						</Fragment>
					))}
					<form
						action={async (data: FormData) => {
							"use server";
							const message = data.get("message")?.toString();
							const file = data.get("file") as File | null;
							const schoology = await getSchoology();
							let upload: any;
							if (file) {
								const buffer = await file.arrayBuffer();
								upload = await schoology("/upload", {
									method: "POST",
									body: JSON.stringify({
										filename: file.name,
										filesize: file.size,
										md5_checksum: md5(buffer),
									}),
								});
								if (upload) {
									(await schoology(`/upload/${upload.id}`, {
										method: "PUT",
										body: buffer,
										contentType: file.type,
										returns: "response",
									})) as Response;
								}
							}
							console.log(upload);
							// uploading is broken
							if (message) {
								await schoology(`/messages/${id}`, {
									method: "POST",
									body: JSON.stringify({
										subject: messages[0].subject,
										message,
										recipient_ids: messages[0].recipient_ids,
										"file-attachment": upload
											? {
													id: [upload.id],
												}
											: undefined,
									}),
								});
							}

							revalidatePath("/messages");
						}}
						className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring w-full"
					>
						<Label htmlFor="message" className="sr-only">
							Message
						</Label>
						<Textarea
							name="message"
							id="message"
							placeholder="Type your message here..."
							className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 bg-background"
						/>
						<div className="flex items-center p-3 pt-0">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon" asChild>
										<Label htmlFor="file">
											<Link className="size-4" />
											<span className="sr-only">Attach file</span>
										</Label>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top">Attach File</TooltipContent>
							</Tooltip>
							<input hidden type="file" id="file" name="file" />
							<Button type="submit" size="sm" className="ml-auto gap-1.5">
								Send Message
								<Send className="size-3.5" />
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
