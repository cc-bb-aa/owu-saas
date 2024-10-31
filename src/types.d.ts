// src/types.d.ts
import type { AuthStore, Record } from 'pocketbase';

declare namespace App {
  interface Locals {
    pb: {
      authStore: AuthStore;
    };
    user: Record | null;
  }
}