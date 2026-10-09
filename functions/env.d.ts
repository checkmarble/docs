// keystatic.config.ts reads Vite's import.meta.env, which is undefined once bundled into a Pages Function.
interface ImportMeta {
	readonly env?: { readonly DEV?: boolean; readonly PUBLIC_KEYSTATIC_GITHUB_REPO?: string };
}
