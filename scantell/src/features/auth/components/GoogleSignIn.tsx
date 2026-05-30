import { signIn } from "@/features/auth/server/authConfig";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleSignInProps {
  callbackUrl: string;
}

export function GoogleSignIn({ callbackUrl }: GoogleSignInProps) {
  return (
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
  );
}
