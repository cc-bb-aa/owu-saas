import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { serializeNonPOJOs } from '$lib/utils';

export const handle: Handle = async ({ event, resolve }) => {
	console.log("PB Server hook started");
	event.locals.pb = new PocketBase(import.meta.env.VITE_PB_URL);
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		if (event.locals.pb.authStore.isValid) {
			event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.model);
		}
	} catch (error) {
		console.error("Error loading auth store:", error);
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	const response = await resolve(event);

	// Manage cookies
	const cookieOptions = { sameSite: 'lax', secure: true, httpOnly: true, path: '/' };
	const cookie = event.locals.pb.authStore.exportToCookie(cookieOptions);

	response.headers.set('set-cookie', cookie);

	return response;
};