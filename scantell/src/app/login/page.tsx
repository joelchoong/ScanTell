import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ScanTell</h1>
          <p className="mt-2 text-gray-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Error message */}
          {searchParams.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {searchParams.error === "OAuthAccountNotLinked"
                ? "This email is already linked to another sign-in method."
                : "Something went wrong. Please try again."}
            </div>
          )}

          {/* Google Sign In */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Magic Link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              try {
                await signIn("nodemailer", {
                  email,
                  redirectTo: callbackUrl,
                });
              } catch (error) {
                if (error instanceof AuthError) {
                  redirect(`/login?error=${error.type}`);
                }
                throw error;
              }
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send magic link
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            We&apos;ll send a sign-in link to your email — no password needed.
          </p>

          {/* ⚠️ DEV ONLY — remove this block before production */}
          {process.env.NODE_ENV !== "production" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-yellow-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-yellow-500 font-medium">
                    dev only
                  </span>
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signIn("dev-bypass", { redirectTo: callbackUrl });
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-yellow-400 rounded-xl text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  <span>⚠️</span>
                  Bypass login (dev only)
                </button>
              </form>
            </>
          )}
          {/* ⚠️ END DEV ONLY */}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
