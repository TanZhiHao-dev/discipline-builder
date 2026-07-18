import { createAuthClient } from "better-auth/react";

// No baseURL — same-origin, so it works on any port and in production.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
