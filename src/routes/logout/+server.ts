import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
    locals.pb.authStore.clear();
    locals.user = undefined;

    // Clear the auth cookie
    cookies.set('pb_auth', '', {
        path: '/',
        expires: new Date(0),
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    });

    // Redirect to the home page
    throw redirect(303, '/');
};

export const GET: RequestHandler = async ({ locals }) => {
    // Clear the auth store
    locals.pb.authStore.clear();
    locals.user = undefined;

    // Clear the auth cookie
    return new Response(null, {
        status: 302,
        headers: {
            'Set-Cookie': 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
            'Location': '/'
        }
    });
};