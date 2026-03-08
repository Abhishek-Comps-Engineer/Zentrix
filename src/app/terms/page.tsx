export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          Effective date: {new Date().toLocaleDateString()}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">1. Acceptable Use</h2>
        <p className="text-muted-foreground leading-7">
          You agree to use Zentrix services lawfully and avoid abusive behavior,
          malicious submissions, unauthorized access attempts, or misuse of
          project infrastructure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">2. Intellectual Property</h2>
        <p className="text-muted-foreground leading-7">
          Content, software, designs, and deliverables remain subject to
          contractual ownership terms. Zentrix retains rights to its pre-existing
          frameworks, tools, and internal accelerators unless otherwise agreed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">3. Service Limitations</h2>
        <p className="text-muted-foreground leading-7">
          Service availability may be affected by maintenance windows, third-party
          platform dependencies, and external network conditions. Zentrix will
          make reasonable efforts to maintain continuity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">4. Liability Limitations</h2>
        <p className="text-muted-foreground leading-7">
          To the maximum extent permitted by law, Zentrix is not liable for
          indirect, incidental, or consequential damages arising from service
          usage, delays, or interruptions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">5. Account Termination Rules</h2>
        <p className="text-muted-foreground leading-7">
          Zentrix may suspend or terminate accounts that violate these terms,
          submit fraudulent requests, or pose security risks. Users may request
          account closure by contacting support.
        </p>
      </section>
    </div>
  )
}
