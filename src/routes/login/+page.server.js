import { redirect, errors } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema } from "$lib/schemas";

console.log("PB Start")
export const load = ({ locals }) => {
	if (locals.pb?.authStore.isValid) {
		throw redirect(303, '/');
	}
	
};

export const actions = {
	login: async ({ request, locals }) => {
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
			await locals.pb.collection("users").authWithPassword(formData.email, formData.password);
			if (!locals.pb?.authStore?.model?.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true
				};
			}

			throw redirect(307, "/");
		} catch (err) {
			console.error("Login error:", err); // Log the error for debugging

			// Assuming err.data contains the error message from the backend
			if (err.data) {
				return {
					data: formData,
					errors: { email: err.data.message || "Invalid credentials" }
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