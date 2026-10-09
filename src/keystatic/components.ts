import { fields } from '@keystatic/core';
import { block, mark, repeating, wrapper } from '@keystatic/core/content-components';
import { Icon } from '@keystar/ui/icon';
import { bookOpenIcon } from '@keystar/ui/icon/icons/bookOpenIcon';
import { columnsIcon } from '@keystar/ui/icon/icons/columnsIcon';
import { imageIcon } from '@keystar/ui/icon/icons/imageIcon';
import { infoIcon } from '@keystar/ui/icon/icons/infoIcon';
import { panelTopIcon } from '@keystar/ui/icon/icons/panelTopIcon';
import { youtubeIcon } from '@keystar/ui/icon/icons/youtubeIcon';
import { createElement, type ReactNode, useEffect, useMemo } from 'react';

// MDX components available in the Keystatic editor, mirroring the ones auto-imported in pages (see astro.config.mjs).
// Their props must match the Astro components in src/components/ and Starlight's Aside/Tabs/TabItem.

const icon = (src: typeof infoIcon) => createElement(Icon, { src });

type ImageData = { data: Uint8Array; extension: string; filename: string } | null;

const MIME_TYPES: Record<string, string> = { jpg: 'image/jpeg', svg: 'image/svg+xml' };

/** Inline preview of a screenshot in the editor, like <Screenshot> renders it (minus the zoom). */
function ScreenshotView({ value }: { value: { src: ImageData; caption: string; alt: string; width: string; bordered: boolean } }) {
	const { src, caption, alt, width, bordered } = value;
	// Keystatic hands over the image's bytes, not a URL.
	const url = useMemo(() => src && URL.createObjectURL(new Blob([src.data as Uint8Array<ArrayBuffer>], { type: MIME_TYPES[src.extension] ?? `image/${src.extension}` })), [src]);

	useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

	return createElement(
		'figure',
		{ style: { margin: 0, textAlign: 'center' } },
		url
			? createElement('img', {
					src: url,
					alt: alt || caption,
					style: { width: width || 'auto', maxWidth: '100%', height: 'auto', ...(bordered && { border: '1px solid #c0c2c7', borderRadius: '0.375rem' }) },
				})
			: createElement('em', null, 'No image selected'),
		caption && createElement('figcaption', { style: { fontSize: '0.875em', fontStyle: 'italic', opacity: 0.7, marginTop: '0.5rem' } }, caption)
	);
}

/** Starlight's callout colors. */
const ASIDES: Record<string, { label: string; color: string }> = {
	note: { label: 'Note', color: '#0b65d8' },
	tip: { label: 'Tip', color: '#7e4cd9' },
	caution: { label: 'Caution', color: '#c06000' },
	danger: { label: 'Danger', color: '#d22630' },
};

/** Callout colored by its type, with its title; the content stays editable inside. */
function AsideView({ value, children }: { value: { type: string; title: string }; children: ReactNode }) {
	const { label, color } = ASIDES[value.type] ?? ASIDES.note;

	return createElement(
		'div',
		{ style: { borderInlineStart: `4px solid ${color}`, background: `${color}1a`, borderRadius: '0.25rem', padding: '0.5rem 1rem' } },
		createElement('div', { contentEditable: false, style: { color, fontWeight: 600 } }, value.title || label),
		children
	);
}

/** A tab shows its label above its content. */
function TabItemView({ value, children }: { value: { label: string }; children: ReactNode }) {
	return createElement(
		'div',
		{ style: { borderInlineStart: '2px solid currentColor', paddingInlineStart: '0.75rem', margin: '0.5rem 0' } },
		createElement('div', { contentEditable: false, style: { fontWeight: 600 } }, value.label || 'Untitled tab'),
		children
	);
}

/** Video thumbnail with its title, as a stand-in for the embedded player. */
function YouTubeView({ value }: { value: { id: string; title: string } }) {
	return createElement(
		'figure',
		{ style: { margin: 0, textAlign: 'center' } },
		value.id && createElement('img', { src: `https://i.ytimg.com/vi/${encodeURIComponent(value.id)}/hqdefault.jpg`, alt: '', style: { maxWidth: '100%', width: '480px' } }),
		createElement('figcaption', { style: { fontSize: '0.875em', marginTop: '0.25rem' } }, `▶ ${value.title || 'YouTube video'}`)
	);
}

/** Components for pages of one content folder: uploaded screenshots go to `src/assets/<folder>/`. */
export function components(folder: string) {
	return {
		Screenshot: block({
			label: 'Screenshot',
			icon: icon(imageIcon),
			schema: {
				src: fields.image({ label: 'Image', directory: `src/assets/${folder}`, publicPath: `${folder}/`, validation: { isRequired: true } }),
				caption: fields.text({ label: 'Caption' }),
				alt: fields.text({ label: 'Alternative text', description: 'For screen readers; defaults to the caption.' }),
				width: fields.text({ label: 'Display width', description: 'e.g. 500px or 75%. The full resolution stays available on zoom.' }),
				bordered: fields.checkbox({ label: 'Border' }),
			},
			ContentView: ScreenshotView,
		}),
		Aside: wrapper({
			label: 'Callout',
			icon: icon(infoIcon),
			schema: {
				type: fields.select({
					label: 'Type',
					options: [
						{ label: 'Note', value: 'note' },
						{ label: 'Tip', value: 'tip' },
						{ label: 'Caution', value: 'caution' },
						{ label: 'Danger', value: 'danger' },
					],
					defaultValue: 'note',
				}),
				title: fields.text({ label: 'Title', description: 'Defaults to the type ("Note", "Tip"…).' }),
			},
			ContentView: AsideView,
		}),
		Tabs: repeating({
			label: 'Tabs',
			icon: icon(panelTopIcon),
			children: ['TabItem'],
			schema: {
				syncKey: fields.text({ label: 'Sync key', description: 'Tab groups sharing a key switch together.' }),
			},
		}),
		TabItem: wrapper({
			label: 'Tab',
			forSpecificLocations: true,
			schema: {
				label: fields.text({ label: 'Label', validation: { length: { min: 1 } } }),
			},
			ContentView: TabItemView,
		}),
		Columns: wrapper({
			label: 'Columns',
			icon: icon(columnsIcon),
			description: 'Each block inside is a column.',
			schema: {},
		}),
		YouTube: block({
			label: 'YouTube video',
			icon: icon(youtubeIcon),
			schema: {
				id: fields.text({ label: 'Video ID', description: 'The part after "v=" in the video URL.', validation: { length: { min: 1 } } }),
				title: fields.text({ label: 'Title', validation: { length: { min: 1 } } }),
			},
			ContentView: YouTubeView,
		}),
		Glossary: mark({
			label: 'Glossary term',
			icon: icon(bookOpenIcon),
			tag: 'abbr',
			style: { borderBottom: '1px dotted currentColor', textDecoration: 'none', cursor: 'help' },
			schema: {
				term: fields.text({ label: 'Term', description: 'Glossary entry, if different from the marked text (e.g. for a plural).' }),
			},
		}),
	};
}
