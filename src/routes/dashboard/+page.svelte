<script>
 import { onMount } from 'svelte';
 import { loadStripe } from '@stripe/stripe-js';
 import { page } from '$app/stores';

 let customerPortalUrl = '';
 let activeSection = 'Profile';
 let userDetails = {};
 let invoices = [];
 let subscription = null;
 let address = {};

 const sections = [
  { title: 'Profile', icon: '👤' },
  { title: 'Account Details', icon: '🔑' },
  { title: 'Invoices', icon: '📄' },
  { title: 'Subscription', icon: '🔄' },
  { title: 'Address', icon: '🏠' }
 ];

 onMount(async () => {
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_SECRET_KEY);
  const customerId = $page.data.locals.pb.authStore.model.stripeCustomerId;
  if (customerId) {
   // Fetch customer portal URL
   const portalResponse = await fetch('/api/create-customer-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId })
   });
   const portalData = await portalResponse.json();
   customerPortalUrl = portalData.url;

   // Fetch user details
   const userResponse = await fetch('/api/user-details');
   userDetails = await userResponse.json();

   // Fetch invoices
   const invoicesResponse = await fetch('/api/invoices');
   invoices = await invoicesResponse.json();

   // Fetch subscription
   const subscriptionResponse = await fetch('/api/subscription');
   subscription = await subscriptionResponse.json();

   // Fetch address
   const addressResponse = await fetch('/api/address');
   address = await addressResponse.json();
  }
 });

 const redirectToCustomerPortal = () => {
  window.location.href = customerPortalUrl;
 };

 const setActiveSection = (section) => {
  activeSection = section;
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
      <p><strong>Name:</strong> {userDetails.name}</p>
      <p><strong>Email:</strong> {userDetails.email}</p>
      <p><strong>Account Type:</strong> {userDetails.accountType}</p>
      <!-- Add more profile details as needed -->
     </div>
    </section>
   {:else if activeSection === 'Account Details'}
    <section class="section-content">
     <h2>Account Details</h2>
     <div class="account-details">
      <p><strong>Username:</strong> {userDetails.username}</p>
      <p><strong>Account Created:</strong> {new Date(userDetails.created).toLocaleDateString()}</p>
      <p><strong>Last Login:</strong> {new Date(userDetails.lastLogin).toLocaleDateString()}</p>
      <!-- Add more account details as needed -->
     </div>
    </section>
   {:else if activeSection === 'Invoices'}
    <section class="section-content">
     <h2>Invoices</h2>
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
      {#each invoices as invoice}
       <tr>
        <td>{invoice.number}</td>
        <td>{new Date(invoice.created * 1000).toLocaleDateString()}</td>
        <td>{(invoice.total / 100).toFixed(2)} {invoice.currency.toUpperCase()}</td>
        <td>{invoice.status}</td>
       </tr>
      {/each}
      </tbody>
     </table>
    </section>
   {:else if activeSection === 'Subscription'}
    <section class="section-content">
     <h2>Subscription</h2>
     {#if subscription}
      <div class="subscription-details">
       <p><strong>Plan:</strong> {subscription.plan.nickname}</p>
       <p><strong>Status:</strong> {subscription.status}</p>
       <p><strong>Current Period End:</strong> {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</p>
       <p><strong>Amount:</strong> {(subscription.plan.amount / 100).toFixed(2)} {subscription.plan.currency.toUpperCase()} / {subscription.plan.interval}</p>
      </div>
      <button on:click={redirectToCustomerPortal} class="manage-subscription-btn">
       Manage Subscription
      </button>
     {:else}
      <p>No active subscription found.</p>
     {/if}
    </section>
   {:else if activeSection === 'Address'}
    <section class="section-content">
     <h2>Address</h2>
     <div class="address-details">
      <p><strong>Street:</strong> {address.line1}</p>
      {#if address.line2}<p><strong>Street 2:</strong> {address.line2}</p>{/if}
      <p><strong>City:</strong> {address.city}</p>
      <p><strong>State/Province:</strong> {address.state}</p>
      <p><strong>Postal Code:</strong> {address.postal_code}</p>
      <p><strong>Country:</strong> {address.country}</p>
     </div>
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

 .manage-subscription-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
 }

 .manage-subscription-btn:hover {
  background-color: #0056b3;
 }
</style>
