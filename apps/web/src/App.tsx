
// App.tsx
import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Bookmark = {
	id: string;
	url: string;
	title: string;
	tags: string; // comma-separated
	created_at: string;
};

export default function App() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	const [newTitle, setNewTitle] = useState("");
	const [newUrl, setNewUrl] = useState("");
	const [newTags, setNewTags] = useState("");

	const api_url = "https://bookmark-api.alexcostaviana.workers.dev/bookmarks";

	const fetchBookmarks = () => {
		setLoading(true);
		const url = selectedTag ? `${api_url}?tag=${encodeURIComponent(selectedTag)}` : api_url;

		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				setBookmarks(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Failed to fetch bookmarks:", err);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchBookmarks();
	}, [selectedTag]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const res = await fetch(api_url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: newTitle,
				url: newUrl,
				tags: newTags.split(",").map((t) => t.trim()).filter(Boolean)
			})
		});

		if (res.ok) {
			// Clear form + close dialog
			setNewTitle("");
			setNewUrl("");
			setNewTags("");
			fetchBookmarks();
		} else {
			console.error("Failed to add bookmark");
		}
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Bookmarks</h1>
				<Dialog>
					<DialogTrigger asChild>
						<Button>Add Link</Button>
					</DialogTrigger>
					<DialogContent>
						<form onSubmit={handleSubmit}>
							<DialogHeader>
								<DialogTitle>Add a New Bookmark</DialogTitle>
								<DialogDescription>
									Enter the details for your new bookmark.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={newTitle}
										onChange={(e) => setNewTitle(e.target.value)}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="url">URL</Label>
									<Input
										id="url"
										type="url"
										value={newUrl}
										onChange={(e) => setNewUrl(e.target.value)}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="tags">Tags (comma-separated)</Label>
									<Input
										id="tags"
										value={newTags}
										onChange={(e) => setNewTags(e.target.value)}
									/>
								</div>
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="outline">Cancel</Button>
								</DialogClose>
								<Button type="submit">Add</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{selectedTag && (
				<div className="mb-4 flex items-center gap-2">
					<span className="text-muted-foreground text-sm">Filtering by tag:</span>
					<Badge variant="outline">{selectedTag}</Badge>
					<Button variant="link" className="text-destructive p-0 h-auto text-sm" onClick={() => setSelectedTag(null)}>
						× Clear
					</Button>
				</div>
			)}

			{loading ? (
				<p className="text-sm text-muted-foreground">Loading…</p>
			) : (

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Link</TableHead>
							<TableHead>Tags</TableHead>
							<TableHead>Created</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{bookmarks.map((bm) => (
							<TableRow key={bm.id}>
								<TableCell>
									<a
										href={bm.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 underline"
									>
										{bm.title}
									</a>
								</TableCell>
								<TableCell className="space-x-1">
									{bm.tags.split(",").map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="cursor-pointer hover:opacity-80"
											onClick={() => setSelectedTag(tag)}
										>
											{tag}
										</Badge>
									))}
								</TableCell>
								<TableCell>{bm.created_at}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}

