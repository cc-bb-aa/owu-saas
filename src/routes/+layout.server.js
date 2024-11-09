import PocketBase from 'pocketbase';

export async function load({ locals }) {
  // Check if the user is authenticated
  if (!locals.pb.authStore.isValid) {
    // Return null for user and subscription if not authenticated
    return {
      user: null,
      subscription: null
    };
  }

  try {
    // Fetch the user data directly
    const user = await locals.pb.collection('users').getOne(locals.pb.authStore.model.id);
    const subscription = await getUsersSubscription(user.id);

    console.log('Current user:', user);
    console.log('User subscription:', subscription);

    return {
      user,
      subscription
    };
  } catch (err) {
    console.error('Error fetching user data:', err);
    // If user is not found, clear the auth store
    if (err.status === 404) {
      locals.pb.authStore.clear();
    }
    return {
      user: null,
      subscription: null
    };
  }
}

async function getUsersSubscription(userId) {
  const adminClient = new PocketBase(import.meta.env.VITE_PB_URL);
  try {
    const user = await adminClient.collection('users').getOne(userId);
    return user.subscription || null; // Return null if subscription doesn't exist
  } catch (err) {
    console.error('Error fetching user subscription:', err);
    return null;
  }
}
