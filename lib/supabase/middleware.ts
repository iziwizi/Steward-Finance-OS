import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/auth/confirm",
  "/forgot-password",
  "/reset-password",
  "/offline",
  "/brand",
  "/icons",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isRootLanding = path === "/";
  const isPublic = isRootLanding || PUBLIC_PREFIXES.some((p) => path.startsWith(p));

  // Helper to construct a redirect that preserves any refreshed session cookies
  function makeRedirect(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const redirectRes = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => {
      redirectRes.cookies.set(c.name, c.value);
    });
    return redirectRes;
  }

  // If not logged in and trying to access a protected app route, redirect to /login
  if (!user && !isPublic) {
    return makeRedirect("/login");
  }

  // If already logged in and visiting /login or /signup, redirect to /dashboard
  if (user && (path === "/login" || path === "/signup")) {
    return makeRedirect("/dashboard");
  }

  return response;
}
