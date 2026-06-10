import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { colors } from "@/lib/design-system";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      {/* S-curve pattern at top */}
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 relative z-10">
        {/* Header with back arrow and centered title */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "#121417" }}>Privacy Policy</h1>
          <div className="w-6" /> {/* Spacer to center the title */}
        </div>

        <div className="space-y-6">
          <p className="text-sm" style={{ color: "#23262B" }}>Last updated: June 2026</p>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>1. Information We Collect</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                We collect information you provide directly to us, including your name, email address, and any documents you upload to our service. We also collect usage data to improve our services.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>2. How We Use Your Information</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                We use your information to provide, maintain, and improve our services. This includes processing your documents, sending you important notifications, and personalizing your experience.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>3. Data Security</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                We implement industry-standard security measures to protect your data. This includes encryption, secure storage, and regular security audits. Your documents are stored securely and are only accessible to you.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>4. Data Retention</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                We retain your documents for as long as your account is active. If you delete your account, your personal information (name and email) will be anonymized, but your documents may be retained for compliance and legal purposes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>5. Your Rights</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                You have the right to access, update, or delete your personal information. You can manage your account settings from the settings page, including the option to delete your account.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>6. Third-Party Services</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                We may use third-party services to help operate our business. These services have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>7. Changes to This Policy</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#121417" }}>8. Contact Us</h2>
              <p className="text-sm" style={{ color: "#23262B" }}>
                If you have any questions about this privacy policy, please contact us through our support channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
