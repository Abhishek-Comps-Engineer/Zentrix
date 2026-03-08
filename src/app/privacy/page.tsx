export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Effective date: {new Date().toLocaleDateString()}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">1. Data Collection</h2>
        <p className="text-muted-foreground leading-7">
          Zentrix collects information you provide directly, including name, email,
          phone number, support messages, and project requirements submitted
          through forms. We also collect service usage metadata needed for
          security, debugging, and service quality.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">2. User Data Protection</h2>
        <p className="text-muted-foreground leading-7">
          We apply access control, encrypted transport (HTTPS), secure password
          hashing, and role-based authorization to protect user data. Access to
          sensitive operational data is restricted to authorized personnel only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">3. Cookies</h2>
        <p className="text-muted-foreground leading-7">
          Zentrix uses HTTP-only session cookies for authentication and secure
          account access. You may disable non-essential browser storage features,
          but disabling auth-related cookies will affect login functionality.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
        <p className="text-muted-foreground leading-7">
          We may rely on infrastructure and communication providers for hosting,
          email delivery, analytics, and operational monitoring. These providers
          process data strictly to support Zentrix services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">5. Contact Information</h2>
        <p className="text-muted-foreground leading-7">
          For privacy questions or requests, contact us at{" "}
          <a className="underline" href="mailto:hello@zentrix.dev">
            hello@zentrix.dev
          </a>{" "}
          or call{" "}
          <a className="underline" href="tel:7058746797">
            7058746797
          </a>
          .
        </p>
      </section>
    </div>
  )
}
