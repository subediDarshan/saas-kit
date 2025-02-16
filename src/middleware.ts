import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isMemberRoute = createRouteMatcher(["/dashboard"]);
// const publicRoutes = createRouteMatcher(["/api/webhook/register"])
const guestRoutes = createRouteMatcher(["/", "/sign-in", "/sign-up"]);
const protectedRoutes = createRouteMatcher(["/dashboard", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();
    const isAdmin = sessionClaims?.metadata?.role === 'admin'
    

    if (protectedRoutes(req)) {
        if (!userId) {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        // Protect all routes starting with `/admin`
        if (isAdminRoute(req) && !isAdmin) {
            const url = new URL("/dashboard", req.url);
            return NextResponse.redirect(url);
        }
        if (isAdmin && isMemberRoute(req)) {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
    }

    if (guestRoutes(req) && userId) {
        return NextResponse.redirect(
            new URL(isAdmin ? "/admin/dashboard" : "/dashboard", req.url)
        );
    }
});
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
