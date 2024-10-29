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
			return {
				status: 400,
				body: {
					data: formData,
					errors: errors.fieldErrors
				}
			};
		}

		try {
			console.log(formData.email)
			await locals.pb
				.collection("users")
				.authWithPassword(formData.email, formData.password);
			if (!locals.pb?.authStore?.model?.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true,
				};
			}

			throw redirect(307, "/");
		} catch (err) {
			console.log("Error: ", err?.data?.message);
			if (err?.data?.message){
				console.log("Wrong")
				return {
					InvalidCred: true,
				};      
			} 
		}
	},

	OAuth: async({cookies,url,locals})=>{
        const authMethods = await locals.pb?.collection('users').listAuthMethods();
        if (!authMethods) {
            return {
                authProviderRedirect: '',
                authProviderState: ''
            };
        }
        const redirectURL = `${url.origin}/oauth`;
        const googleAuthProvider = authMethods.authProviders[0];
        const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`;
        const state = googleAuthProvider.state;
        const verifier = googleAuthProvider.codeVerifier

        cookies.set('state',state);
        cookies.set('verifier',verifier);

		console.log("oauth ready")
        throw redirect(302,authProviderRedirect)
    },
};
