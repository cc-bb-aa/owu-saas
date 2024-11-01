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
    const user = locals.user;
    const subscription = await getUsersSubscription(user.id);
    return {
      user,
      subscription
    };
  } catch (err) {
    if (err.status === 404) {
      console.warn('User not found, returning null');
      return {
        user: null,
        subscription: null
      };
    } else {
      throw err;
    }
  }
}

async function getUsersSubscription(userId) {
  const adminClient = new PocketBase(import.meta.env.VITE_PB_URL);
  const user = await adminClient.collection('users').getOne(userId);
  return user.subscription;
}