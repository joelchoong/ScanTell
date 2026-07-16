import { colors, typography } from "@/lib/design-system";
import { FileX, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ background: colors.primary.gradientTransparent }}
    >
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="softui-card p-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-100">
            <FileX className="w-10 h-10 text-gray-500" />
          </div>
          
          <h1 className={`${typography.heroTitle} text-gray-900 mb-3`}>
            Page not found
          </h1>
          
          <p className={`${typography.bodySecondary} text-gray-600 mb-8`}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link
            href="/"
            className="softui-btn px-6 py-3 inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
