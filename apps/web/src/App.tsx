
import React, { useEffect, useState } from "react";

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

	// Fetch bookmarks with optional tag filter
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
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Bookmarks</h1>


			{selectedTag && (
				<div className="mb-4 flex items-center space-x-2">
					<span className="text-gray-700">Filtering by tag:</span>
					<span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm font-medium">
						{selectedTag}
					</span>
					<button
						onClick={() => setSelectedTag(null)}
						className="text-sm text-red-600 underline hover:text-red-800"
					>
						× Clear
					</button>
				</div>
			)}

			{loading ? (
				<p>Loading…</p>
			) : (
				<table className="min-w-full table-auto border border-gray-300">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-4 py-2 text-left border">Title</th>
							<th className="px-4 py-2 text-left border">URL</th>
							<th className="px-4 py-2 text-left border">Tags</th>
							<th className="px-4 py-2 text-left border">Created At</th>
						</tr>
					</thead>
					<tbody>
						{bookmarks.map((bm) => (
							<tr key={bm.id} className="hover:bg-gray-50">
								<td className="px-4 py-2 border">{bm.title}</td>
								<td className="px-4 py-2 border">
									<a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
										{bm.url}
									</a>
								</td>
								<td className="px-4 py-2 border">
									{bm.tags.split(",").map((tag) => (
										<button
											key={tag}
											onClick={() => setSelectedTag(tag)}
											className="mr-2 text-sm text-blue-600 underline hover:text-blue-800"
										>
											{tag}
										</button>
									))}
								</td>
								<td className="px-4 py-2 border">{bm.created_at}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

