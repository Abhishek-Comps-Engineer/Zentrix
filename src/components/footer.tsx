import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Zentrix
            </h3>
            <p className="text-sm text-muted-foreground w-full max-w-xs">
              Empowering businesses with modern software, AI solutions, and
              scalable enterprise applications.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services#web" className="hover:text-foreground transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/services#mobile" className="hover:text-foreground transition-colors">
                  Mobile Applications
                </Link>
              </li>
              <li>
                <Link href="/services#ai" className="hover:text-foreground transition-colors">
                  AI & ML Solutions
                </Link>
              </li>
              <li>
                <Link href="/services#saas" className="hover:text-foreground transition-colors">
                  SaaS Platforms
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-foreground transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t pt-8 text-xs text-muted-foreground">
          <p>(c) {new Date().getFullYear()} Zentrix Technologies. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="mailto:hello@zentrix.dev" className="hover:text-foreground transition-colors">
              Email
            </a>
            <a href="tel:7058746797" className="hover:text-foreground transition-colors">
              Call
            </a>
            <a
              href="https://wa.me/917058746797"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
