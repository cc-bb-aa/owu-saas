import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw error(401, 'Unauthorized');
	}

	try {
		const user = locals.pb.authStore.model;
		let subscription = null;
		let invoices = [];

		if (user.stripeCustomerId) {
			const subscriptions = await stripe.subscriptions.list({
				customer: user.stripeCustomerId,
				status: 'active',
				expand: ['data.default_payment_method'],
			});

			if (subscriptions.data.length > 0) {
				subscription = subscriptions.data[0];
			}

			const invoiceList = await stripe.invoices.list({
				customer: user.stripeCustomerId,
				limit: 5,
			});

			invoices = invoiceList.data;
		}

		const prices = await stripe.prices.list({
			active: true,
			expand: ['data.product'],
		});

		return {
			user,
			subscription,
			invoices,
			prices: prices.data,
		};
	} catch (err) {
		console.error('Error loading dashboard data:', err);
		throw error(500, 'Internal Server Error');
	}
};
