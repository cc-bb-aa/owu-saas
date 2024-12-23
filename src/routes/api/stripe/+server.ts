import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';

const stripe = new Stripe(`${import.meta.env.VITE_STRIPE_SECRET_KEY}`, {
	apiVersion: '2022-11-15'
});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.pb.authStore.isValid) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const user = locals.pb.authStore.model;
	const { action, priceId } = await request.json();

	switch (action) {
		case 'createCheckoutSession':
			return createCheckoutSession(user, priceId);
		case 'createCustomerPortalSession':
			return createCustomerPortalSession(user);
		case 'cancelSubscription':
			return cancelSubscription(user);
		default:
			return json({ error: 'Invalid action' }, { status: 400 });
	}
};

async function createCheckoutSession(user, priceId) {
	try {
		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [{ price: priceId, quantity: 1 }],
			customer: user.stripeCustomerId || undefined,
			success_url: `${import.meta.env.VITE_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${import.meta.env.VITE_PUBLIC_SITE_URL}/dashboard`,
		});

		return json({ url: session.url });
	} catch (err) {
		console.error('Error creating checkout session:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

async function createCustomerPortalSession(user) {
	try {
		const session = await stripe.billingPortal.sessions.create({
			customer: user.stripeCustomerId,
			return_url: `${import.meta.env.VITE_PUBLIC_SITE_URL}/dashboard`,
		});

		return json({ url: session.url });
	} catch (err) {
		console.error('Error creating customer portal session:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

async function cancelSubscription(user) {
	try {
		const subscriptions = await stripe.subscriptions.list({
			customer: user.stripeCustomerId,
			status: 'active',
		});

		if (subscriptions.data.length === 0) {
			return json({ error: 'No active subscription found' }, { status: 404 });
		}

		const subscription = await stripe.subscriptions.update(subscriptions.data[0].id, {
			cancel_at_period_end: true,
		});

		return json({ message: 'Subscription cancelled successfully', subscription });
	} catch (err) {
		console.error('Error cancelling subscription:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
