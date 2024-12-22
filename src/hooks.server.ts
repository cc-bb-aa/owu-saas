import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { serializeNonPOJOs } from '$lib/utils';

import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(import.meta.env.VITE_PB_URL);
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.model);
		}
	} catch (_) {
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	const response = await resolve(event);

	const isProd = process.env.NODE_ENV === 'production';

	response.headers.set(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ secure: isProd, sameSite: 'lax', httpOnly: true })
	);

	return response;
};
