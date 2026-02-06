import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hostname = request.headers.get("host") || "";
  const isAppSubdomain = hostname.startsWith("app.");

  // 1. If NOT on app subdomain (Main Landing Page)
  if (!isAppSubdomain) {
    // Allow access to public routes (Landing Page, Legal)
    const publicPaths = ["/", "/legal", "/login"];
    const isPublic = publicPaths.some(path => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/"));

    if (isPublic) {
      return supabaseResponse;
    }

    // Otherwise, redirect to the main landing page if they hit something else?
    // Or just let it through if it's not restricted.
    return supabaseResponse;
  }

  // 2. If ON app subdomain (app.dndlcreative.com)
  if (isAppSubdomain) {
    // If NOT logged in & NOT on login page -> Kick to Login
    if (!user && !request.nextUrl.pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // If LOGGED IN & ON login page -> Kick to Dashboard
    if (user && request.nextUrl.pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/task-master"; // Ensure they go to the dashboard
      return NextResponse.redirect(url);
    }

    // If LOGGED IN & AT ROOT (/) -> Kick to Dashboard
    if (user && request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/task-master";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
