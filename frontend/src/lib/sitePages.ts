// Every static page on the site, with a human label and its built-in SEO
// defaults — shared by the pages' own head(), the sitemap route and the admin
// SEO panel (which pre-fills its fields from these, so what admin shows is
// exactly what's live until someone saves an override).
//
// Title: keyword first, 50–60 chars. Description: 140–160 chars with a call
// to action. Keywords are for admin reference/tracking.
export type SitePage = {
  path: string;
  label: string;
  title: string;
  description: string;
  keywords: string;
  /** Share image (og:image), site-relative. */
  image: string;
  /** Breadcrumb parent, if not directly under Home. */
  parent?: { name: string; path: string };
};

export const SITE_PAGES: SitePage[] = [
  {
    path: "/",
    label: "Home",
    title: "Indian Restaurant Sydney CBD | The Grand Palace",
    description:
      "Indian fine dining at 261 George Street, Sydney CBD. Halal meats and a HACCP certified kitchen. Book a table, host a private event or order catering today.",
    keywords:
      "indian restaurant sydney cbd, indian fine dining sydney, halal indian restaurant sydney, the grand palace",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/about",
    label: "About Us",
    title: "About The Grand Palace | Indian Restaurant Sydney CBD",
    description:
      "The Grand Palace serves traditional Indian cuisine in a royal palace-inspired setting in Sydney CBD. Authentic flavours, HACCP certified, Gold Licensed.",
    keywords: "about the grand palace, indian restaurant sydney cbd, authentic indian food sydney",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/beverages",
    label: "Beverages",
    title: "Drinks Menu: Cocktails, Wine & Spirits | The Grand Palace",
    description:
      "Premium cocktails, curated wines, craft beers and fine spirits to pair with authentic Indian food at The Grand Palace, 261 George Street, Sydney CBD. Book now.",
    keywords:
      "cocktails sydney cbd, indian restaurant drinks menu, wine bar sydney cbd, indian whisky sydney",
    image: "/site-image-defaults/beverages-hero.jpg",
    parent: { name: "Menu", path: "/menu" },
  },
  {
    path: "/birthday-package",
    label: "Celebrate Birthday",
    title: "Birthday Party Venue Sydney CBD | The Grand Palace",
    description:
      "Celebrate your birthday at The Grand Palace Indian Restaurant Sydney. $150 package includes cake, décor & songs. Set menus from $40pp. Groups up to 125 guests.",
    keywords:
      "birthday party venue sydney cbd, birthday dinner sydney, birthday restaurant sydney, indian birthday party sydney",
    image: "/site-image-defaults/home-private-celebration-section.png",
    parent: { name: "Events", path: "/events" },
  },
  {
    path: "/book-a-table",
    label: "Book a Table",
    title: "Book a Table at The Grand Palace | Sydney CBD",
    description:
      "Reserve your table at The Grand Palace Indian Restaurant, 261 George Street, Sydney CBD. Book online in seconds for lunch or dinner, open seven days a week.",
    keywords:
      "book a table sydney cbd, indian restaurant reservation sydney, the grand palace booking",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/career",
    label: "Career",
    title: "Careers at The Grand Palace | Restaurant Jobs Sydney CBD",
    description:
      "Join the team at The Grand Palace, a family-run Indian restaurant in Sydney CBD. See our current job openings for chefs, cooks and restaurant staff and apply online.",
    keywords: "restaurant jobs sydney cbd, indian chef jobs sydney, hospitality jobs sydney",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact The Grand Palace | Indian Restaurant Sydney CBD",
    description:
      "Contact The Grand Palace Indian Restaurant in Sydney CBD. Call (02) 8021 7696 or email bookings@thegrandpalace.com.au. Basement, 261 George Street.",
    keywords:
      "the grand palace contact, indian restaurant george street sydney, indian restaurant near wynyard",
    image: "/site-image-defaults/contact-hero.jpg",
  },
  {
    path: "/events",
    label: "Events",
    title: "Events & Function Venue Sydney CBD | The Grand Palace",
    description:
      "Corporate functions, birthdays, engagements and private celebrations for up to 125 guests at The Grand Palace, Sydney CBD — plus Indian catering at your venue.",
    keywords:
      "function venue sydney cbd, event venue sydney cbd, private event restaurant sydney, corporate function venue sydney",
    image: "/site-image-defaults/events-hero.jpg",
  },
  {
    path: "/gallery",
    label: "Gallery",
    title: "Photo Gallery | The Grand Palace Indian Restaurant Sydney",
    description:
      "Explore photos of The Grand Palace — our stunning interiors, exquisite Indian cuisine, birthday celebrations, corporate events and more in Sydney CBD.",
    keywords:
      "the grand palace photos, indian restaurant interior sydney, event venue photos sydney",
    image: "/site-image-defaults/gallery-hero.jpg",
  },
  {
    path: "/gift-card",
    label: "Gift Card",
    title: "Restaurant Gift Vouchers Sydney | The Grand Palace",
    description:
      "Give the gift of fine Indian dining. The Grand Palace gift vouchers are perfect for birthdays, anniversaries and any occasion. Buy online in minutes.",
    keywords:
      "restaurant gift voucher sydney, gift card sydney restaurant, indian restaurant gift voucher",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/guides",
    label: "Guides Hub",
    title: "Sydney Restaurant & Dining Guides | The Grand Palace",
    description:
      "Local dining guides from The Grand Palace — the best Indian, vegetarian, halal, group and celebration restaurants in Sydney, plus catering and event tips.",
    keywords: "sydney dining guide, best restaurants sydney, best indian restaurant sydney",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/blog",
    label: "Blog Hub",
    title: "Blog | The Grand Palace Indian Restaurant Sydney",
    description:
      "Tips on birthdays, events, weddings, office catering and Indian food from The Grand Palace — Indian fine dining at 261 George Street, Sydney CBD.",
    keywords: "indian restaurant blog sydney, event planning tips sydney, indian catering tips",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/lunch-special",
    label: "Lunch Special",
    title: "Lunch Special Sydney CBD from $35 | The Grand Palace",
    description:
      "Three curated Indian lunch banquets — Halka $35, Fulka $45 and Bhari $60. Available every day 12pm–3pm at The Grand Palace, 261 George Street, Sydney CBD.",
    keywords:
      "lunch special sydney cbd, indian lunch sydney cbd, lunch deals sydney cbd, business lunch sydney",
    image: "/site-image-defaults/lunch-special-hero.jpg",
    parent: { name: "Menu", path: "/menu" },
  },
  {
    path: "/menu",
    label: "Menu Hub",
    title: "Indian Restaurant Menu Sydney CBD | The Grand Palace",
    description:
      "Explore our à la carte Indian dishes, set menu banquets, lunch specials and drinks at The Grand Palace, Sydney CBD. Halal meats plus vegetarian and vegan options.",
    keywords:
      "indian restaurant menu sydney, indian food menu sydney cbd, halal indian menu sydney",
    image: "/site-image-defaults/menu-index-hero.jpg",
  },
  {
    path: "/menu/a-la-carte",
    label: "À la Carte Menu",
    title: "À la Carte Indian Menu Sydney CBD | The Grand Palace",
    description:
      "Our full à la carte menu of authentic Indian dishes — tandoori, curries, biryani, breads and desserts — with halal, vegetarian and vegan options in Sydney CBD.",
    keywords:
      "a la carte indian menu, indian curry sydney cbd, biryani sydney cbd, tandoori sydney",
    image: "/site-image-defaults/alacarte-hero.jpg",
    parent: { name: "Menu", path: "/menu" },
  },
  {
    path: "/office-catering",
    label: "Office Catering",
    title: "Office Catering Sydney CBD | The Grand Palace",
    description:
      "Premium Indian office catering in Sydney CBD. Full-service catering to your venue, or fresh platter boxes from $75 for pickup/delivery. HACCP certified.",
    keywords:
      "office catering sydney cbd, corporate catering sydney, indian catering sydney, catering boxes sydney",
    image: "/site-image-defaults/office-catering-hero.jpg",
  },
  {
    path: "/set-menu",
    label: "Set Menu",
    title: "Indian Set Menu Banquets Sydney CBD | The Grand Palace",
    description:
      "Three curated Indian banquets at The Grand Palace, Sydney CBD — Vegetarian $65, Non-Vegetarian $70 and TGP Special $95 per person. Ideal for groups.",
    keywords: "indian set menu sydney, banquet menu sydney cbd, group dining menu sydney",
    image: "/site-image-defaults/setmenu-hero.jpg",
    parent: { name: "Menu", path: "/menu" },
  },
  {
    path: "/terms",
    label: "Terms & Conditions",
    title: "Terms & Conditions | The Grand Palace Indian Restaurant",
    description:
      "Terms and conditions for dining, bookings, online ordering, gift cards and events at The Grand Palace Indian Restaurant, 261 George Street, Sydney CBD.",
    keywords: "the grand palace terms and conditions",
    image: "/site-image-defaults/about-hero.jpg",
  },
  {
    path: "/venue-catering",
    label: "Venue Catering",
    title: "Venue Catering Sydney | The Grand Palace Indian Restaurant",
    description:
      "Luxury Indian venue catering across Sydney & NSW. Elegant canapés to multi-course banquets. HACCP certified. Engagements, weddings, birthdays and more.",
    keywords:
      "indian catering sydney, wedding catering sydney, event catering sydney, engagement catering sydney",
    image: "/site-image-defaults/home-venue-catering-section.jpg",
    parent: { name: "Events", path: "/events" },
  },
  {
    path: "/venue-for-hire",
    label: "Venue for Hire",
    title: "Private Venue for Hire Sydney CBD | The Grand Palace",
    description:
      "Hire The Grand Palace for private events in Sydney CBD — up to 125 guests. Birthdays, baby showers, anniversaries and corporate functions from $45pp.",
    keywords:
      "venue for hire sydney cbd, private dining room sydney, function room hire sydney, party venue sydney cbd",
    image: "/site-image-defaults/home-venue-hire-section.png",
    parent: { name: "Events", path: "/events" },
  },
  {
    path: "/whats-on",
    label: "What's On",
    title: "What's On: Offers & Deals | The Grand Palace Sydney CBD",
    description:
      "Latest offers, deals and events at The Grand Palace, Sydney CBD. $20 Takeaway Biryani, Birthday Packages, Buy 3 Get 1 Free Cocktails & more.",
    keywords:
      "restaurant deals sydney cbd, food offers sydney cbd, indian restaurant specials sydney",
    image: "/site-image-defaults/about-hero.jpg",
  },
];

export const SITE_PAGE_BY_PATH = new Map(SITE_PAGES.map((p) => [p.path, p]));

/** Head for a static page — its defaults above, admin override on top, and
 *  a Home › (Parent ›) Page breadcrumb. */
export function sitePage(path: string): SitePage {
  const p = SITE_PAGE_BY_PATH.get(path);
  if (!p) throw new Error(`No SITE_PAGES entry for ${path}`);
  return p;
}
