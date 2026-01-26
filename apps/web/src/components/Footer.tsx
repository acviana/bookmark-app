export default function Footer() {
	return (
		<footer className="w-full border-t mt-10 py-4 text-center text-sm text-muted-foreground">
			Created by{' '}
			<a href="https://acviana.com" className="text-primary hover:underline hover:text-primary/80">
				Alex C. Viana
			</a>{' '}
			|{' '}
			<a href="https://github.com/acviana/bookmark-app" className="text-primary hover:underline hover:text-primary/80">
				Source
			</a>{' '}
			| Powered by{' '}
			<a href="https://www.cloudflare.com/" className="text-primary hover:underline hover:text-primary/80">
				Cloudflare
			</a>
		</footer>
	);
}
