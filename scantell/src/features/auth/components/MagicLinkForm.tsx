import { signIn } from "@/features/auth/server/authConfig";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

interface MagicLinkFormProps {
  callbackUrl: string;
}

export function MagicLinkForm({ callbackUrl }: MagicLinkFormProps) {
  return (
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
  );
}
