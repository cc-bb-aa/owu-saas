/** @type {import('@sveltejs/kit').Handle} */
import PocketBase from 'pocketbase';
import { serializeNonPOJOs } from '$lib/utils';

export async function handle({ event, resolve }) {
	console.log("PB Server hook started");
	event.locals.pb = new PocketBase(import.meta.env.VITE_PB_URL);
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
	try {
		if (event.locals.pb.authStore.isValid) {
			event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.model);
		}
	} catch (_) {
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html,  // If you need to transform HTML
		filterSerializedResponseHeaders: (name) => name === 'set-cookie'
	});

	// Instead of appending, you can set headers within resolve options or use a mutable headers object
	if (response.headers.has('set-cookie')) {
		let cookies = response.headers.get('set-cookie');
		if (!Array.isArray(cookies)) {
			cookies = [cookies];
		}
		cookies.push(event.locals.pb.authStore.exportToCookie({ sameSite: 'Lax', secure: true }));
		response.headers.set('set-cookie', cookies);
	} else {
		response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie({ sameSite: 'Lax', secure: true }));
	}

	return response;
};