import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { getCollection } from 'astro:content';

// Starlight labels groups generated from subfolders with the folder name (e.g. "data-model-edition"). Use the title of
// the folder's index page instead ("Data model edition"); that page is the group's first entry, labelled "Overview".

type Entry = StarlightRouteData['sidebar'][number];

const titles = new Map((await getCollection('docs')).map((entry) => [`/${entry.id}/`, entry.data.title]));

function relabel(entries: Entry[]): Entry[] {
	return entries.map((entry) => {
		if (entry.type !== 'group') return entry;

		const first = entry.entries[0];
		const title = first?.type === 'link' && first.href.endsWith(`/${entry.label}/`) ? titles.get(first.href) : undefined;

		return { ...entry, label: title ?? entry.label, entries: relabel(entry.entries) };
	});
}

export const onRequest = defineRouteMiddleware((context) => {
	context.locals.starlightRoute.sidebar = relabel(context.locals.starlightRoute.sidebar);
});
