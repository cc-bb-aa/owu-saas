import PocketBase from 'pocketbase';
import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

const stripe = new Stripe(`${import.meta.env.VITE_STRIPE_SECRET_KEY}`, {
  apiVersion: '2022-11-15'
});

export async function load({ locals }) {
  if (!locals.pb.authStore.isValid) {
    return {
      user: null,
      subscription: null
    };
  }

  try {
    const user = locals.user;
    let subscription = null;

    console.log('User: '+ user.name);

    // Only try to fetch subscription if user has a stripeCustomerId
    if (user.subscription) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'active',
          limit: 1
        });
        subscription = subscriptions.data[0] || null;
      } catch (stripeError) {
        console.error('Error fetching Stripe subscription:', stripeError);
        // Don't throw here, just log the error and continue with null subscription
      }
    }

    console.log('Current user:', user);
    console.log('User subscription:', subscription);

    return {
      user,
      subscription
    };
  } catch (err) {
    console.error('Error loading user data:', err);
    return {
      user: null,
      subscription: null
    };
  }
}
