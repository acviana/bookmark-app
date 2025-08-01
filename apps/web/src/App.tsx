
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

	const api_url = "https://bookmark-api.alexcostaviana.workers.dev/bookmarks";

	useEffect(() => {
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
	}, [selectedTag]);

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Bookmarks</h1>

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
							<TableHead>Title</TableHead>
							<TableHead>URL</TableHead>
							<TableHead>Tags</TableHead>
							<TableHead>Created</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{bookmarks.map((bm) => (
							<TableRow key={bm.id}>
								<TableCell>{bm.title}</TableCell>
								<TableCell>
									<a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
										{bm.url}
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

