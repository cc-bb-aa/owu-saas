import { redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema } from "$lib/schemas";

export const load = ({ locals }) => {
	if (locals.pb?.authStore.isValid) {
		throw redirect(303, '/dashboard');
	}
	return {
		isAuthenticated: locals.pb?.authStore.isValid || false
	};
};

export const actions = {
	login: async ({ request, locals }) => {
		const { formData, errors } = await validateData(
			await request.formData(),
			loginUserSchema,
		);

		if (errors) {
			return {
				data: formData,
				errors: errors.fieldErrors
			};
		}

		try {
			const authData = await locals.pb.collection('users').authWithPassword(formData.email, formData.password);

			if (!authData.token) {
				throw new Error("Authentication failed");
			}

			if (!locals.pb.authStore.model.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true
				};
			}

			// Include the Stripe customer ID in the session
			locals.pb.authStore.model.stripeCustomerId = authData.stripeCustomerId;

			throw redirect(307, "/dashboard");
		} catch (err) {
			console.error("Login error:", err);
			return {
				data: formData,
				errors: { email: err.data?.message || err.message || "An unexpected error occurred" }
			};
		}
	}
};