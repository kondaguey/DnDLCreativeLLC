import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 1. THIS FUNCTION MUST BE ASYNC NOW
export async function createClient() {
  // 2. WE MUST AWAIT THE COOKIES
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Handled by Next.js middleware
          }
        },
      },
    },
  );
}
