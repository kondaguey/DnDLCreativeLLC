import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

export async function proxy(request: NextRequest) {
  // 1. Run the session update (Supabase Auth)
  const supabaseResponse = await updateSession(request);

  // 2. Detection Logic
  const host = request.headers.get("host") || "";
  const forwardedHost = request.headers.get("x-forwarded-host") || "";
  const hostname = forwardedHost || host;

  const isAppSubdomain =
    hostname.startsWith("app.dndlcreative.com") ||
    hostname.startsWith("app.localhost"); const pathname = request.nextUrl.pathname;

  // 3. Routing Logic for app.dndlcreative.com
  if (isAppSubdomain) {
    // If they hit the root of the app subdomain, they should be in task-master
    // updateSession handles the redirect to /login if not authenticated.
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/task-master";
      return NextResponse.redirect(url);
    }
  }

  // 4. Routing Logic for main domain (dndlcreative.com)
  if (!isAppSubdomain) {
    // Ensure that if they somehow hit internal admin routes on the main domain, they are handled.
    // But usually we just let the public flow through.
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
