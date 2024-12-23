import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(`${import.meta.env.VITE_STRIPE_SECRET_KEY}`, {
	apiVersion: '2022-11-15'
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals?.pb) {
		throw error(401, 'Unauthorized');
	}

	try {
		const currentUser = await locals.pb.collection('users').getOne(locals.user.id);

		console.log('currentUser sub: '+currentUser.subscription)
		let subscription = null;

		let invoices = [];
		let availablePlans = [];

		if (currentUser.subscription) {
			try {
				// Get customer's subscription
				console.log('Sub ID: '+currentUser.subscription)
				const subscriptions = await stripe.subscriptions.list({
					customer: currentUser.stripe_customer_id,
					limit: 1,
					status: 'active',
					expand: ['data.plan']
				});

				if (subscriptions.data.length > 0) {
					subscription = subscriptions.data[0];
				}

				// Get customer's invoices
				const customerInvoices = await stripe.invoices.list({
					customer: currentUser.stripe_customer_id,
					limit: 10
				});
				invoices = customerInvoices.data;
			} catch (stripeErr) {
				console.error('Error fetching customer data:', stripeErr);
			}
		}

		// Get available prices/plans
		try {
			const prices = await stripe.prices.list({
				active: true,
				type: 'recurring',
				expand: ['data.product']
			});
			availablePlans = prices.data;
		} catch (stripeErr) {
			console.error('Error fetching prices:', stripeErr);
		}

		return {
			currentUser,
			subscription,
			invoices,
			availablePlans
		};
	} catch (err) {
		console.error('Error in load function:', err);
		throw error(500, 'Internal Server Error');
	}
};
