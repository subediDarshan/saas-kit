import { auth } from "@clerk/nextjs/server";

async function isAdmin() {
    const {sessionClaims} = await auth()
    return sessionClaims?.metadata?.role === 'admin'
}

