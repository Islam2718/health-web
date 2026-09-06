import Link from "next/link";
import { Globe, Mail, MessageCircle, Send } from "lucide-react";
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Platform: [
    { label: "Find Doctors", href: "/doctors" },
    { label: "Hospitals", href: "/hospitals" },
    { label: "Ambulance", href: "/ambulances" },
    { label: "Diagnostics", href: "/diagnostics" },
    { label: "Pharmacy", href: "/medical-store" },
    { label: "Community", href: "/community" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Data Security", href: "#" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              One connected platform for patients, doctors, hospitals,
              diagnostics, pharmacies, and emergency care.
            </p>
            <div className="mt-5 flex gap-3 text-muted-foreground">
              {[Globe, MessageCircle, Send, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-foreground">{heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Ibnocare. All rights reserved.</p>
          <p>Made with care, for care.</p>
        </div>
      </div>
    </footer>
  );
}
