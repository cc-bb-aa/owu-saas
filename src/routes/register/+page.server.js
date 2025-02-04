import { error, redirect } from '@sveltejs/kit';
import { registerUserSchema } from '$lib/schemas';
import { generateUsername, validateData } from '$lib/utils';
import PocketBase from 'pocketbase';

export const actions = {
	register: async ({ locals, request }) => {
		const { formData, errors } = await validateData(await request.formData(), registerUserSchema);

		if (errors) {
			// Return validation errors
			return {
				data: formData,
				errors: errors.fieldErrors
			};
		}

		const adminClient = new PocketBase(import.meta.env.VITE_PB_URL);
		try {
			const authData = await adminClient.admins.authWithPassword(
				import.meta.env.VITE_AUTH_ADMIN_NAME,
				import.meta.env.VITE_AUTH_ADMIN_PASS,
				{
					autoRefreshThreshold: 30 * 60
				}
			);

			console.debug('auth Data is valid: ', adminClient.authStore.isValid);
			console.debug('auth Data token: ', authData.token);
			console.debug('auth Data model id: ', adminClient.authStore.model.id);

			// Generate a username if one is not provided
			let username = formData.username || generateUsername(formData.name);

			// Check if the username already exists (optional, depends on your requirements)
			let existingUser = null;
			try {
				existingUser = await adminClient.collection('users').getFirstListItem(`username = "${username}"`);
				console.debug('existingUser:', existingUser);
			} catch (err) {
				if (err.status !== 404) {
					throw err;
				}
			}

			if (existingUser) {
				return {
					userNameExist: true
				};
			}

			// Get the latest user number
			const resultList = await adminClient.collection('users').getList(1, 1, { sort: 'created' });
			const UserNumAdd = (resultList?.items[0]?.UserNumber || 0) + 1;

			// Create the user
			const userData = {
				username,
				...formData,
				UserNumber: UserNumAdd
			};
			console.debug('Creating user with data:', userData);

			const record = await adminClient.collection('users').create(userData);

			// Request email verification
			await adminClient.collection('users').requestVerification(formData.email);

			throw redirect(303, '/login'); // Redirect to login after successful registration
		} catch (err) {
			console.error('Registration error:', err);

			// Handle specific PocketBase errors
			if (err.data?.data?.username?.code === 'validation') {
				return {
					userNameExist: true
				};
			} else if (err.data?.data?.email?.code === 'validation') {
				return {
					userEmailExist: true
				};
			} else if (err.data?.data?.password?.code) {
				return {
					userPasswordPass: true
				};
			} else {
				throw error(500, 'Something went wrong');
			}
		}
	}
};