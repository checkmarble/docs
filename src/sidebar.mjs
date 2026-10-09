// Sidebar: one group per section, listing the pages of its folder in src/content/docs/.
// Pages are ordered by `sidebar.order` in their frontmatter; a subfolder is a collapsed group led by its index.mdx
// (labelled with that page's title, see src/routeData.ts). New pages appear without any change here.
const section = (label, directory) => ({ label, items: [{ autogenerate: { directory, collapsed: true } }] });

export const sidebar = [
	{ label: 'Welcome to Marble!', slug: 'welcome' },
	section('Overview', 'overview'),
	section('Getting started', 'getting-started'),
	section('Data model and ingestion', 'data-model'),
	section('Scenarios', 'scenarios'),
	section('Case Manager', 'case-manager'),
	section('Workflows', 'workflows'),
	section('Webhooks', 'webhooks'),
	section('Screening', 'screening'),
	section('Customer Risk Assessment', 'risk-assessment'),
	section('Settings', 'settings'),
	section('Tech and infrastructure', 'infrastructure'),
	{
		label: 'API',
		items: [
			{ autogenerate: { directory: 'api' } },
			{ label: 'API reference (v1)', link: '/api/v1/' },
			{ label: 'Beta endpoints', link: '/api/v1beta/', badge: 'Beta' },
		],
	},
];
