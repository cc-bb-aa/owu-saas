import { redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema } from "$lib/schemas";

export const load = ({ locals }) => {
	if (locals.pb?.authStore.isValid) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions = {
	login: async ({ request, locals, fetch }) => {  // Add 'fetch' from the event
		const { formData, errors } = await validateData(
			await request.formData(),
			loginUserSchema,
		);

		if (errors) {
			// Return validation errors
			return {
				data: formData,
				errors: errors.fieldErrors
			};
		}

		try {
			// Use event.fetch for internal relative API calls
			const response = await fetch(`/api/collections/users/auth-with-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					identity: formData.email,
					password: formData.password
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Authentication failed");
			}

			const data = await response.json();
			locals.pb.authStore.save(data.token, data.record);

			if (!locals.pb?.authStore?.model?.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true
				};
			}

			throw redirect(307, "/");
		} catch (err) {
			console.error("Login error:", err); // Log the error for debugging

			// Assuming err.message contains the error message from the backend
			if (err.message) {
				return {
					data: formData,
					errors: { email: err.message }
				};
			} else {
				return {
					data: formData,
					errors: { email: "An unexpected error occurred" }
				};
			}
		}
	}
};