<script>
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components';
	import toast from 'svelte-french-toast';

	export let form = null;
	let loading = false;


	const submitLogin = () => {
		loading = true;
		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					await update();
					break;
				case 'error':
				case 'invalid':
					toast.error('Invalid credentials'); // General error message
					if (result.data) {
						// Update form with server-returned data and errors
						form = {
							errors: result.data.errors || {},
							data: result.data.data || {}
						};
					}
					break;
				case 'notVerified':
					toast.error('Your account has not been verified');
					break;
			}
			loading = false;
		};
	};
</script>


<div class="p-5 flex flex-col items-center h-full w-full pt-32 sm:pt-40 md:pt-28">
	<h2 class="mt-2 text-center text-3xl font-bold tracking-tight text-base-content">Login</h2>
	<p class="text-center mt-1">or <a href="/register" class="text-primary font-medium hover:cursor-pointer hover:underline yellow">Register</a> if you don't have an account
	</p>
	<form action="?/login" method="POST" class="flex flex-col items-center space-y-2 w-full pt-4" use:enhance={submitLogin}>
		{#if form?.errors?.email}
			<div class="text-red-500">{form.errors.email}</div>
		{/if}
		<Input type="email" id="email" label="Email" value={form?.data?.email ?? ''} disabled={loading} />
		<Input type="password" id="password" label="Password" errors={form?.errors?.password} disabled={loading} />
		<div class="w-full max-w-lg pt-2">
			<button type="submit" class="btn variant-filled-secondary btn-primary w-full" disabled={loading}>Login</button>
		</div>
		<div class="w-full max-w-lg">
			<a href="/reset-password" class="font-medium text-primary hover:cursor-pointer hover:underline">Forgot password?</a>
		</div>

		{#if form?.notVerified}
			<div class="alert alert-error shadow-lg w-full max-w-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Please verify your account first!</span>
				</div>
			</div>
		{/if}
		{#if form?.InvalidCred}
			<div class="alert alert-error shadow-lg w-full max-w-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>Wrong information</span>
				</div>
			</div>
		{/if}
	</form>
</div>
