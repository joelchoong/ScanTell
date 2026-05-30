import { signIn } from "@/features/auth/server/authConfig";

interface DevBypassProps {
  callbackUrl: string;
}

export function DevBypass({ callbackUrl }: DevBypassProps) {
  if (process.env.NODE_ENV === "production") return null;

  return (
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
  );
}
