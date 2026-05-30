import Image from "next/image";
import { GoogleSignIn } from "./GoogleSignIn";
import { MagicLinkForm } from "./MagicLinkForm";
import { DevBypass } from "./DevBypass";

export function LoginForm({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center softui-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src="/scantell-logo.svg"
            alt="ScanTell"
            width={180}
            height={180}
            priority
          />
          <p className="mt-2 text-[#5a5a6a]">Sign in to your account</p>
        </div>

        <div className="softui-card p-8 space-y-6">
          {/* Error message */}
          {searchParams.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {searchParams.error === "OAuthAccountNotLinked"
                ? "This email is already linked to another sign-in method."
                : "Something went wrong. Please try again."}
            </div>
          )}

          {/* Google Sign In */}
          <GoogleSignIn callbackUrl={callbackUrl} />

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
          <MagicLinkForm callbackUrl={callbackUrl} />

          <p className="text-center text-xs text-gray-400">
            We&apos;ll send a sign-in link to your email — no password needed.
          </p>

          <DevBypass callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
