import type PocketBase from 'pocketbase';

declare global {
	namespace App {
		interface Locals {
			pb: PocketBase;
			user: {
				id: string;
				email: string;
				name: string;
				subscription: string;
				stripe_customer_id: string;
				username: string;
				created: string;
				updated: string;
				verified: boolean;
				collectionId: string;
				collectionName: string;
			} | null;
		}
	}
}

export {};
