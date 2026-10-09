import { readdirSync } from 'node:fs';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import type { AstroIntegration } from 'astro';

import keystaticConfig from '../../keystatic.config';

// Keystatic without an SSR adapter: the admin at /keystatic is a prerendered page (src/pages/keystatic/), and its API
// (/api/keystatic/*) is served here by the dev server, and in production by functions/api/keystatic/[[path]].ts.
// Mirrors what @keystatic/astro's integration does, minus its on-demand routes.

export default function keystatic(): AstroIntegration {
	return {
		name: 'keystatic',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				// Pages of a content folder without a collection couldn't be edited.
				const folders = readdirSync('src/content/docs', { withFileTypes: true }).filter((entry) => entry.isDirectory());
				const missing = folders.map((entry) => entry.name).filter((folder) => !(folder in (keystaticConfig.collections ?? {})));

				if (missing.length) {
					throw new Error(`keystatic.config.ts: no collection for src/content/docs/${missing.join(', ')}; add it to FOLDERS.`);
				}

				updateConfig({
					vite: {
						plugins: [
							{
								name: 'keystatic',
								configureServer(server) {
									server.middlewares.use(async (req, res, next) => {
										// Same fallback as public/_redirects for the admin's client-side routes.
										if (req.url?.startsWith('/keystatic/')) {
											req.url = '/keystatic';
											return next();
										}

										if (!req.url?.startsWith('/api/keystatic/')) {
											return next();
										}

										const chunks: Buffer[] = [];

										for await (const chunk of req) chunks.push(chunk);

										const body = Buffer.concat(chunks).toString();
										const response = await makeGenericAPIRouteHandler({ config: keystaticConfig })({
											url: new URL(req.url, `http://${req.headers.host}`).toString(),
											method: req.method ?? 'GET',
											headers: { get: (name) => req.headers[name.toLowerCase()]?.toString() ?? null },
											json: async () => JSON.parse(body),
										});

										res.statusCode = response.status ?? 200;
										new Headers(response.headers).forEach((value, name) => res.setHeader(name, value));
										res.end(response.body);
									});
								},
							},
						],
						optimizeDeps: { entries: ['keystatic.config.*'] },
					},
				});
			},
		},
	};
}
