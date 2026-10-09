import { collection, config, fields } from '@keystatic/core';

import { components } from './src/keystatic/components';

// Keystatic CMS at /keystatic: https://keystatic.com/docs/configuration
// Runs in the browser, in the dev server (src/keystatic/integration.ts) and in the Pages Function (functions/api/keystatic/).

/** Content folders of src/content/docs/, in sidebar order, with their sidebar section names. */
const FOLDERS = {
	overview: 'Overview',
	'getting-started': 'Getting started',
	'data-model': 'Data model and ingestion',
	scenarios: 'Scenarios',
	'case-manager': 'Case Manager',
	workflows: 'Workflows',
	webhooks: 'Webhooks',
	screening: 'Screening',
	'risk-assessment': 'Customer Risk Assessment',
	settings: 'Settings',
	infrastructure: 'Tech and infrastructure',
	api: 'API',
};

const pages = (folder: string, label: string) =>
	collection({
		label,
		// Pages in subfolders too: a subfolder is a sidebar group, led by its index page.
		path: `src/content/docs/${folder}/**`,
		slugField: 'title',
		format: { contentField: 'body' },
		entryLayout: 'content',
		previewUrl: `/${folder}/{slug}/`,
		schema: {
			title: fields.slug({ name: { label: 'Title' }, slug: { label: 'URL', description: `The page is at /${folder}/<URL>/.` } }),
			description: fields.text({ label: 'Description', description: 'Shown in search engines and link previews.' }),
			// Starlight's `sidebar` frontmatter (see src/sidebar.mjs).
			sidebar: fields.object(
				{
					order: fields.integer({
						label: 'Position',
						description: 'Pages are sorted by this number within their section (e.g. 450 goes between 400 and 500). Empty puts the page last.',
					}),
					label: fields.text({ label: 'Sidebar label', description: 'Defaults to the title.' }),
				},
				{ label: 'Sidebar' }
			),
			body: fields.mdx({ label: 'Content', components: components(folder), options: { image: false } }),
		},
	});

export default config({
	storage: import.meta.env?.DEV
		? { kind: 'local' }
		: {
				kind: 'github',
				// `owner/name`; PUBLIC_KEYSTATIC_GITHUB_REPO at build time points it elsewhere (e.g. a fork, for testing).
				repo: (import.meta.env?.PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined) ?? 'checkmarble/docs',
			},
	ui: {
		brand: { name: 'Marble docs' },
	},
	collections: Object.fromEntries(Object.entries(FOLDERS).map(([folder, label]) => [folder, pages(folder, label)])),
});
