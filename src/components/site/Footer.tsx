import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

const cols = [
  { title: "Shop", links: ["New Arrivals", "Men", "Women", "Kids", "Sale"] },
  { title: "Help", links: ["Shipping", "Returns", "Size Guide", "FAQ", "Contact"] },
  { title: "Company", links: ["About", "Careers", "Press", "Stores", "Sustainability"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Authenticity"] },
];

export function Footer() {
  const handleInfoClick = (linkName: string) => {
    switch (linkName) {
      case "Shipping":
        toast.info("Free worldwide express shipping on all orders over $150!");
        break;
      case "Returns":
        toast.info("7-day returns policy. Contact support at support@teensemporium.com to initiate a return.");
        break;
      case "Size Guide":
        toast.info("Sneakers are listed in standard US Men's sizes. We recommend going true to size.");
        break;
      case "FAQ":
        toast.info("FAQ: Shipping takes 3-5 days. Payments are securely processed via Card or Cash on Delivery.");
        break;
      case "Contact":
        toast.info("Need support? Contact us at support@teensemporium.com or click 'Book via WhatsApp' in your cart.");
        break;
      case "About":
        toast.info("Teens Emporium is a premium destination for luxury sneakers and curated streetwear drops.");
        break;
      case "Careers":
        toast.info("We're always looking for sneakerheads to join our team! Contact careers@teensemporium.com.");
        break;
      case "Press":
        toast.info("For media and press inquiries, please contact press@teensemporium.com.");
        break;
      case "Stores":
        toast.info("Our flagship showrooms are located in New York, London, and Tokyo.");
        break;
      case "Sustainability":
        toast.info("Teens Emporium uses 100% recycled packaging. All shipments are carbon-neutral.");
        break;
      case "Privacy":
        toast.info("We secure your data with 256-bit encryption. Read our privacy documentation for details.");
        break;
      case "Terms":
        toast.info("By purchasing, you agree to our terms of service, returns window, and shipping policies.");
        break;
      case "Cookies":
        toast.info("We use cookies to save your cart, wishlist, and session. Manage preferences in your browser.");
        break;
      case "Authenticity":
        toast.info("Every drop is verified by our in-house authentication experts. 100% authentic sneaker guarantee.");
        break;
      default:
        toast.info(`${linkName} information: Contact customer service for full details.`);
    }
  };

  return (
    <footer className="mt-12 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-primary)]">
                <span className="font-display text-base font-black text-white">T</span>
              </div>
              <div className="leading-none text-left">
                <div className="font-display text-base font-bold tracking-[0.2em]">TEENS</div>
                <div className="font-display text-[11px] tracking-[0.4em] text-muted-foreground">EMPORIUM</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground text-left">
              A premium destination for the world's most coveted sneakers — curated, authenticated, delivered.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Follow us on social media for exclusive drops!");
                  }}
                  className="grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title} className="text-left">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {c.title}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      {c.title === "Shop" ? (
                        <Link
                          to="/shop"
                          className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                        >
                          {l}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleInfoClick(l)}
                          className="text-sm text-foreground/80 hover:text-foreground transition-colors border-none bg-transparent p-0 cursor-pointer text-left focus:outline-none"
                        >
                          {l}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Teens Emporium. All rights reserved.</div>
          <div>Designed with precision. Built for collectors.</div>
        </div>
      </div>
    </footer>
  );
}
