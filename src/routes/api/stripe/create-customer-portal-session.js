import Stripe from 'stripe';
import { json } from '@sveltejs/kit';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export async function POST({ request }) {
 const { customerId } = await request.json();

 try {
  const session = await stripe.billingPortal.sessions.create({
   customer: customerId,
   return_url: process.env.RETURN_URL,
  });

  return json({ url: session.url });
 } catch (error) {
  return json({ error: error.message }, { status: 500 });
 }
}