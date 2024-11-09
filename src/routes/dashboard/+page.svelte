<script>
 import { onMount } from 'svelte';
 import { loadStripe } from '@stripe/stripe-js';
 import { page } from '$app/stores';

 let customerPortalUrl = '';
 let activeSection = 'Profile';

 const sections = [
  { title: 'Profile', icon: '👤', content: 'Manage your profile details here.' },
  { title: 'Account Details', icon: '🔑', content: 'Update your account settings.' },
  { title: 'Invoices', icon: '📄', content: 'View and manage your invoices.' },
  { title: 'Subscription', icon: '🔄', content: 'Check your subscription details.' },
  { title: 'Manage Subscription', icon: '⚙️', content: 'Change or cancel your subscription.' },
  { title: 'Address', icon: '🏠', content: 'Manage your shipping and billing addresses.' }
 ];

 onMount(async () => {
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_SECRET_KEY);
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

 const setActiveSection = (section) => {
  activeSection = section;
 };
</script>

<div class="dashboard">
 <h1>Dashboard</h1>
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
   {#each sections as section}
    {#if activeSection === section.title}
     <section class="section-content">
      <h2>{section.title}</h2>
      <p>{section.content}</p>
      {#if section.title === 'Manage Subscription'}
       <button on:click={redirectToCustomerPortal} disabled={!customerPortalUrl}>
        Manage Subscription
       </button>
      {/if}
      <!-- Add more specific content or forms for each section here -->
     </section>
    {/if}
   {/each}
  </main>
 </div>
</div>

<style>
 .dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
 }

 .dashboard-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
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
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s;
 }

 .nav-item:hover, .nav-item.active {
  background-color: #e0e0e0;
 }

 .icon {
  margin-right: 10px;
 }

 .main-content {
  flex-grow: 1;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
 }

 .section-content {
  margin-bottom: 20px;
 }

 button {
  background-color: #007bff;
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
 }

 button:hover:not(:disabled) {
  background-color: #f4914e;
 }

 button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
 }
</style>
