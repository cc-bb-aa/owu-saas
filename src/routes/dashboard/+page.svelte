<script>
 import { onMount } from 'svelte';
 import { loadStripe } from '@stripe/stripe-js';
 import { page } from '$app/stores';

 let customerPortalUrl = '';

 onMount(async () => {
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_SECRET_KEY);

  // Fetch the customer ID from the authentication logic
  const customerId = $page.data.locals.pb.authStore.model.stripeCustomerId;

  if (customerId) {
    const response = await fetch('/api/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customerId })
    });
    const data = await response.json();
    customerPortalUrl = data.url;
  }
 });

 const redirectToCustomerPortal = () => {
  window.location.href = customerPortalUrl;
 };
</script>

<div class="dashboard">
 <h1>Dashboard</h1>
 <section>
  <h2>Profile</h2>
  <!-- Add user/business profile management here -->
 </section>
 <section>
  <h2>Account Details</h2>
  <!-- Add account details management here -->
 </section>
 <section>
  <h2>Invoices</h2>
  <!-- Add invoices management here -->
 </section>
 <section>
  <h2>Subscription</h2>
  <button on:click={redirectToCustomerPortal} disabled={!customerPortalUrl}>Manage Subscription</button>
 </section>
 <section>
  <h2>Address</h2>
  <!-- Add address management here -->
 </section>
</div>