declare module 'cloudflare:test' {
	// eslint-disable-next-line no-undef
	interface ProvidedEnv extends Env {
		// eslint-disable-next-line no-undef
		ASSETS: Fetcher;
		// eslint-disable-next-line no-undef
		TEST_MIGRATIONS: D1Migration[];
	}
}
