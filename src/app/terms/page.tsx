import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { colors } from "@/lib/design-system";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>

          <h1 className="text-xl font-bold" style={{ color: "#121417" }}>
            Terms & Conditions
          </h1>

          <div className="w-6" />
        </div>

        <div className="space-y-6">

          <p className="text-sm" style={{ color: "#23262B" }}>
            Last updated: June 2026
          </p>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              1. Acceptance of Terms
            </h2>

            <p className="text-sm">
              By accessing or using ScanTell, you agree to be bound by these
              Terms & Conditions. If you do not agree with these terms, please
              do not use the service.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              2. About ScanTell
            </h2>

            <p className="text-sm">
              ScanTell is an AI-powered document understanding platform that
              helps users analyse, summarise, and better understand documents
              through OCR and artificial intelligence technologies.
            </p>

            <p className="text-sm mt-2">
              ScanTell is designed to help users understand information more
              easily and does not replace professional advice or services.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              3. AI-Generated Information
            </h2>

            <p className="text-sm">
              ScanTell uses artificial intelligence to analyse uploaded
              documents and generate summaries, explanations, questions, and
              responses.
            </p>

            <p className="text-sm mt-2">
              While we aim to provide useful and accurate information,
              AI-generated responses may contain mistakes, incomplete
              information, or misunderstandings.
            </p>

            <p className="text-sm mt-2">
              Users should always verify important information against the
              original document.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              4. No Professional Advice
            </h2>

            <p className="text-sm">
              ScanTell does not provide insurance advice, financial advice,
              legal advice, medical advice, or professional recommendations.
            </p>

            <p className="text-sm mt-2">
              ScanTell does not determine insurance coverage, claim eligibility,
              claim outcomes, legal obligations, or financial decisions.
            </p>

            <p className="text-sm mt-2">
              Users should consult qualified professionals or relevant service
              providers before making important decisions.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              5. User Responsibilities
            </h2>

            <p className="text-sm">
              By using ScanTell, you agree that:
            </p>

            <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
              <li>
                You only upload documents that you own or have permission to use.
              </li>
              <li>
                You are responsible for reviewing AI-generated information.
              </li>
              <li>
                You will not use ScanTell for unlawful or harmful activities.
              </li>
              <li>
                You will not upload documents that violate another person's privacy or rights.
              </li>
            </ul>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              6. Uploaded Documents
            </h2>

            <p className="text-sm">
              Users retain ownership of documents uploaded to ScanTell.
            </p>

            <p className="text-sm mt-2">
              By uploading documents, you grant ScanTell permission to process
              those documents only for the purpose of providing the service,
              including document analysis and AI-powered features.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              7. Free Usage & Credits
            </h2>

            <p className="text-sm">
              ScanTell may provide free access with limited AI credits or usage
              limits.
            </p>

            <p className="text-sm mt-2">
              We reserve the right to modify, reduce, or introduce limitations
              to free features as the service evolves.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              8. Service Availability
            </h2>

            <p className="text-sm">
              ScanTell is continuously improved and may be updated,
              modified, temporarily unavailable, or discontinued at any time.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              9. Limitation of Liability
            </h2>

            <p className="text-sm">
              To the maximum extent permitted by law, ScanTell shall not be
              responsible for losses, damages, or decisions made based on
              information generated through the service.
            </p>

            <p className="text-sm mt-2">
              Users acknowledge that AI-generated information should be treated
              as assistance and not as a guaranteed source of truth.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              10. Account Termination
            </h2>

            <p className="text-sm">
              We may suspend or terminate accounts that violate these Terms &
              Conditions or misuse the service.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              11. Changes to These Terms
            </h2>

            <p className="text-sm">
              We may update these Terms & Conditions from time to time.
              Continued use of ScanTell after updates means you accept the
              revised terms.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              12. Governing Law
            </h2>

            <p className="text-sm">
              These Terms & Conditions shall be governed by and interpreted in
              accordance with the laws of Malaysia.
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold mb-2">
              13. Contact Us
            </h2>

            <p className="text-sm">
              If you have questions regarding these Terms & Conditions, please
              contact us through our support channels.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
