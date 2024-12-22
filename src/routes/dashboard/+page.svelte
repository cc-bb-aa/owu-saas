<script lang="ts">
 import { onMount } from 'svelte';
 import { loadStripe } from '@stripe/stripe-js';
 import { page } from '$app/stores';

 export let data;

 let stripePromise;
 let customerPortalUrl = '';
 let activeSection = 'Profile';

 const sections = [
  { title: 'Profile', icon: '👤' },
  { title: 'Account Details', icon: '🔑' },
  { title: 'Invoices', icon: '📄' },
  { title: 'Subscription', icon: '🔄' },
  { title: 'Address', icon: '🏠' }
 ];

 onMount(async () => {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const customerId = $page.data.locals.pb.authStore.model.stripeCustomerId;
  if (customerId) {
   const response = await fetch('/api/create-customer-portal-session', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json'
    },
    body: JSON.stringify({ customerId })
   });
   const portalData = await response.json();
   customerPortalUrl = portalData.url;
  }
 });

 const setActiveSection = (section) => {
  activeSection = section;
 };

 const redirectToCustomerPortal = () => {
  if (customerPortalUrl) {
   window.location.href = customerPortalUrl;
  }
 };

 const handleSubscribe = async (priceId) => {
  const stripe = await stripePromise;
  const response = await fetch('/api/create-checkout-session', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ priceId })
  });
  const session = await response.json();
  const result = await stripe.redirectToCheckout({
   sessionId: session.id
  });
  if (result.error) {
   console.error(result.error.message);
  }
 };
</script>

<div class="dashboard">
 <h1 class="dashboard-title">Dashboard</h1>
 <div class="dashboard-content">
  <nav class="sidebar">
   {#each sections as section}
    <button
      class="nav-item"
      class:active={activeSection === section.title}
      on:click={() => setActiveSection(section.title)}
    >
     <span class="icon">{section.icon}</span>
     {section.title}
    </button>
   {/each}
  </nav>
  <main class="main-content">
   {#if activeSection === 'Profile'}
    <section class="section-content">
     <h2>Profile</h2>
     <div class="profile-details">
      <p><strong>Name:</strong> {data.user.name}</p>
      <p><strong>Email:</strong> {data.user.email}</p>
     </div>
    </section>
   {:else if activeSection === 'Account Details'}
    <section class="section-content">
     <h2>Account Details</h2>
     <div class="account-details">
      <p><strong>Username:</strong> {data.user.username}</p>
      <p><strong>Account Created:</strong> {new Date(data.user.created).toLocaleDateString()}</p>
     </div>
    </section>
   {:else if activeSection === 'Invoices'}
    <section class="section-content">
     <h2>Invoices</h2>
     {#if data.invoices && data.invoices.length > 0}
      <table class="invoice-table">
       <thead>
       <tr>
        <th>Invoice Number</th>
        <th>Date</th>
        <th>Amount</th>
        <th>Status</th>
       </tr>
       </thead>
       <tbody>
       {#each data.invoices as invoice}
        <tr>
         <td>{invoice.number}</td>
         <td>{new Date(invoice.created * 1000).toLocaleDateString()}</td>
         <td>{(invoice.total / 100).toFixed(2)} {invoice.currency.toUpperCase()}</td>
         <td>{invoice.status}</td>
        </tr>
       {/each}
       </tbody>
      </table>
     {:else}
      <p>No invoices found.</p>
     {/if}
    </section>
   {:else if activeSection === 'Subscription'}
    <section class="section-content">
     <h2>Subscription</h2>
     {#if data.subscription}
      <div class="subscription-details">
       <p><strong>Plan:</strong> {data.subscription.plan.nickname}</p>
       <p><strong>Status:</strong> {data.subscription.status}</p>
       <p><strong>Current Period End:</strong> {new Date(data.subscription.current_period_end * 1000).toLocaleDateString()}</p>
       <p><strong>Amount:</strong> {(data.subscription.plan.amount / 100).toFixed(2)} {data.subscription.plan.currency.toUpperCase()} / {data.subscription.plan.interval}</p>
      </div>
      <button on:click={redirectToCustomerPortal} class="manage-subscription-btn" disabled={!customerPortalUrl}>
       Manage Subscription
      </button>
     {:else}
      <p>No active subscription found.</p>
      <h3>Available Plans</h3>
      <div class="available-plans">
       {#each data.availablePlans as plan}
        <div class="plan-card">
         <h4>{plan.nickname}</h4>
         <p>{(plan.amount / 100).toFixed(2)} {plan.currency.toUpperCase()} / {plan.interval}</p>
         <button on:click={() => handleSubscribe(plan.id)} class="subscribe-btn">
          Subscribe
         </button>
        </div>
       {/each}
      </div>
     {/if}
    </section>
   {:else if activeSection === 'Address'}
    <section class="section-content">
     <h2>Address</h2>
     {#if data.address}
      <div class="address-details">
       <p><strong>Street:</strong> {data.address.line1}</p>
       {#if data.address.line2}<p><strong>Street 2:</strong> {data.address.line2}</p>{/if}
       <p><strong>City:</strong> {data.address.city}</p>
       <p><strong>State/Province:</strong> {data.address.state}</p>
       <p><strong>Postal Code:</strong> {data.address.postal_code}</p>
       <p><strong>Country:</strong> {data.address.country}</p>
      </div>
     {:else}
      <p>No address information found.</p>
     {/if}
    </section>
   {/if}
  </main>
 </div>
</div>

<style>
 .dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
 }

 .dashboard-title {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
 }

 .dashboard-content {
  display: flex;
  gap: 40px;
 }

 .sidebar {
  width: 250px;
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
 }

 .nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  margin-bottom: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s;
  font-size: 1.1em;
 }

 .nav-item:hover, .nav-item.active {
  background-color: #e0e0e0;
 }

 .icon {
  margin-right: 15px;
  font-size: 1.2em;
 }

 .main-content {
  flex-grow: 1;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
 }

 .section-content h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
 }

 .profile-details, .account-details, .subscription-details, .address-details {
  display: grid;
  gap: 15px;
 }

 .invoice-table {
  width: 100%;
  border-collapse: collapse;
 }

 .invoice-table th, .invoice-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
 }

 .invoice-table th {
  background-color: #f2f2f2;
  font-weight: bold;
 }

 .available-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
 }

 .plan-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
 }

 .plan-card h4 {
  margin-bottom: 10px;
 }

 .subscribe-btn, .manage-subscription-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
 }

 .subscribe-btn:hover, .manage-subscription-btn:hover {
  background-color: #218838;
 }

 .subscribe-btn:disabled, .manage-subscription-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
 }
</style>
