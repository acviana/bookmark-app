import React, { useEffect, useState } from "react";

type Bookmark = {
	id: string;
	url: string;
	title: string;
	tags: string;
	created_at: string;
};

export default function App() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [loading, setLoading] = useState(true);
	// const api_url = "http://localhost:8787/bookmarks";
	const api_url = "https://bookmark-api.alexcostaviana.workers.dev/bookmarks"

	useEffect(() => {
		fetch(api_url)
			.then((res) => res.json())
			.then((data) => {
				setBookmarks(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Failed to fetch bookmarks:", err);
				setLoading(false);
			});
	}, []);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Bookmarks</h1>
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
									<a href={bm.url} target="_blank" className="text-blue-600 underline">
										{bm.url}
									</a>
								</td>
								<td className="px-4 py-2 border">{bm.tags}</td>
								<td className="px-4 py-2 border">{bm.created_at}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

