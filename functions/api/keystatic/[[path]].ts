// Keystatic's API in production (GitHub login and token refresh for the admin at /keystatic): a Cloudflare Pages
// Function, so the site itself stays static. The dev server serves the same API (src/keystatic/integration.ts).
// Secrets of the Pages project: those of the Keystatic GitHub App (see README).
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';

import config from '../../../keystatic.config';

interface Env {
	KEYSTATIC_GITHUB_CLIENT_ID: string;
	KEYSTATIC_GITHUB_CLIENT_SECRET: string;
	KEYSTATIC_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
	const handler = makeGenericAPIRouteHandler({
		config,
		clientId: env.KEYSTATIC_GITHUB_CLIENT_ID,
		clientSecret: env.KEYSTATIC_GITHUB_CLIENT_SECRET,
		secret: env.KEYSTATIC_SECRET,
	});
	const { body, headers, status } = await handler(request);

	return new Response(body, { status, headers });
};
