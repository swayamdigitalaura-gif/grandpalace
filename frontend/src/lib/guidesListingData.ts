export type Tag = "All" | "Events" | "Catering" | "Dining" | "Local";

export interface GuideItem {
  title: string;
  excerpt: string;
  date: string;
  tag: Tag;
  slug: string;
}

export const TAGS: Tag[] = ["All", "Events", "Catering", "Dining", "Local"];

export const tagColors: Record<Tag, string> = {
  All: "#c8860a",
  Events: "#e05454",
  Catering: "#16a085",
  Dining: "#6366f1",
  Local: "#c8860a",
};

export const guides: GuideItem[] = [
  { title: "Indian Restaurant Near Wynyard Station Sydney — 1-Minute Walk to The Grand Palace", excerpt: "If you work near Wynyard Station in Sydney CBD, you're just one minute from the finest Indian dining experience in the city.", date: "Jun 26, 2026", tag: "Local", slug: "indian-restaurant-near-wynyard-station-sydney" },
  { title: "Indian Restaurant Near Martin Place Sydney — 5 Minutes from The Grand Palace", excerpt: "Working near Martin Place? The Grand Palace is about a 5-minute walk away in Sydney CBD's George Street dining strip.", date: "Jul 22, 2026", tag: "Local", slug: "indian-restaurant-near-martin-place" },
  { title: "Indian Restaurant Near Town Hall Station Sydney — One Stop from The Grand Palace", excerpt: "Based near Town Hall? The Grand Palace is one train stop up the line at Wynyard, or a straightforward walk up George Street.", date: "Jul 22, 2026", tag: "Local", slug: "indian-restaurant-near-town-hall-station" },
  { title: "Best Birthday Venues in Sydney CBD for Groups — 2026 Guide", excerpt: "Choosing the right birthday venue in Sydney CBD takes more than a quick Google search. Here's everything you need to know.", date: "Jun 25, 2026", tag: "Events", slug: "best-birthday-venues-sydney-cbd" },
  { title: "Jain Restaurants in Sydney: No Onion, No Garlic Indian Food Guide 2026", excerpt: "Finding a Jain-friendly restaurant in Sydney is harder than it seems. Here's how The Grand Palace caters to Jain dietary requirements.", date: "Jun 9, 2026", tag: "Dining", slug: "jain-restaurants-in-sydney-no-onion-no-garlic" },
  { title: "How to Plan Office Lunch Catering in Sydney", excerpt: "Planning office lunch catering in Sydney can feel overwhelming — especially when you are balancing dietary requirements and tight schedules.", date: "May 13, 2026", tag: "Catering", slug: "how-to-plan-office-lunch-catering-in-sydney" },
  { title: "Indian Wedding Catering Sydney — Your Complete Planning Guide", excerpt: "Planning the perfect Indian wedding catering in Sydney is one of the most important decisions you'll make. Here's your complete guide.", date: "May 13, 2026", tag: "Events", slug: "indian-wedding-catering-sydney" },
  { title: "Indian Food Delivery Sydney CBD — What to Order", excerpt: "Looking for the best Indian food delivery in Sydney CBD? Whether you are ordering for one or feeding a crowd, here's what to order.", date: "May 8, 2026", tag: "Dining", slug: "indian-food-delivery-sydney-cbd" },
  { title: "Private Event Venue Hire Sydney CBD", excerpt: "Searching for the perfect private event venue in Sydney CBD for 2026? The Grand Palace offers exclusive hire options for any occasion.", date: "Apr 23, 2026", tag: "Events", slug: "private-event-venue-hire-sydney" },
  { title: "Best Halal Indian Restaurant Sydney 2026", excerpt: "Searching for a halal Indian restaurant in Sydney? The Grand Palace on George Street, Sydney CBD, is your answer.", date: "Apr 23, 2026", tag: "Dining", slug: "best-halal-restaurant-in-sydney" },
  { title: "Best Indian Birthday Dinner Sydney 2026 — Where to Celebrate in Style", excerpt: "Planning an Indian birthday dinner in Sydney for 2026? The Grand Palace is where milestones become memories.", date: "Apr 23, 2026", tag: "Events", slug: "best-indian-birthday-dinner-sydney-where-to-celebrate-in-style" },
  { title: "Indian Catering Box Sydney — Office Platters, Party Boxes & Corporate Orders", excerpt: "Need an Indian catering box in Sydney for your office lunch, team meeting or party? Discover our popular catering options.", date: "Apr 23, 2026", tag: "Catering", slug: "indian-catering-box-sydney-cbd" },
  { title: "Best Indian Restaurant Near Me in Sydney CBD — The Grand Palace Guide", excerpt: "If you've searched 'Indian restaurant near me' in Sydney CBD, you've likely come across The Grand Palace. Here's everything you need to know.", date: "Apr 22, 2026", tag: "Local", slug: "best-indian-restaurant-near-me-sydney-cbd-the-grand-palace-guide" },
  { title: "Best 15 Vegan Restaurant in Sydney", excerpt: "Sydney has become a thriving destination for vegan food lovers, offering everything from plant-based fine dining to casual vegan cafes.", date: "Dec 31, 2025", tag: "Dining", slug: "best-vegan-restaurant-sydney" },
  { title: "15 Best Christmas Lunch and Dinner Restaurants in Sydney", excerpt: "Christmas in Sydney is one of the most exciting times of the year, and choosing the right restaurant is key to a perfect celebration.", date: "Dec 8, 2025", tag: "Dining", slug: "christmas-lunch-and-dinner-restaurants-in-sydney" },
  { title: "Christmas Corporate Catering Box by The Grand Palace", excerpt: "The festive season is a time of celebration, connection and appreciation — especially in the workplace. Make it memorable.", date: "Nov 5, 2025", tag: "Catering", slug: "christmas-corporate-catering-box-by-tgp" },
  { title: "Make Your Birthday Memorable with Authentic Indian Cuisine and Elegant Ambience", excerpt: "Birthdays are special — they're milestones that deserve celebration, laughter, and an unforgettable setting.", date: "Nov 5, 2025", tag: "Events", slug: "make-birthday-memorable-with-tgp" },
  { title: "Why The Grand Palace is Sydney's Favourite Spot for Christmas Lunch and Dinner", excerpt: "If you're looking to enjoy the most memorable Christmas lunch or dinner, look no further than The Grand Palace.", date: "Oct 31, 2025", tag: "Dining", slug: "why-tgp-best-for-christmas-lunch-and-dinner" },
  { title: "Why The Grand Palace is the Best Spot for a Relaxed Weekend Indian Lunch", excerpt: "After a long week, everyone deserves a little relaxation — and what better way than a leisurely weekend Indian lunch.", date: "Sep 23, 2025", tag: "Dining", slug: "tgp-is-best-for-a-weekend-indian-lunch" },
  { title: "Why Our Catering Boxes Are Perfect for Parties, Office Lunches, and More", excerpt: "Finding the right catering solution for parties, office lunches, or team gatherings has never been easier.", date: "Sep 23, 2025", tag: "Catering", slug: "catering-boxes-in-sydney-for-parties" },
  { title: "Private Corporate Dining in Sydney CBD — Client Entertainment at The Grand Palace", excerpt: "When client entertainment is the point, not just the fuel, The Grand Palace's reserved dining sections and Gold Licensed bar give Sydney CBD businesses a setting worth booking.", date: "Sep 23, 2025", tag: "Catering", slug: "private-corporate-dining-sydney-cbd" },
  { title: "Why The Grand Palace is Sydney's Top Choice for Hosting a Memorable Diwali Party", excerpt: "Diwali, the festival of lights, is celebrated with joy and grandeur — and The Grand Palace provides the perfect backdrop.", date: "Sep 22, 2025", tag: "Events", slug: "why-tgp-is-best-for-diwali-party" },
  { title: "The Best Family Restaurants in Sydney", excerpt: "Finding the perfect spot for a family meal in Sydney is now easier than ever. From large groups to intimate family dinners.", date: "Jul 31, 2025", tag: "Dining", slug: "best-family-restaurants-sydney" },
  { title: "Top 10 Indian Restaurants in Western Sydney You Must Try in 2025", excerpt: "Western Sydney is a vibrant melting pot of cultures, and when it comes to Indian restaurants, there's no shortage of choices.", date: "Jul 30, 2025", tag: "Local", slug: "indian-restaurants-western-sydney" },
  { title: "Best Mocktails & Drinks to Pair with Indian Food", excerpt: "Indian cuisine is known for its layers of flavour. Discover the best mocktails and drinks that complement your meal.", date: "Jul 19, 2025", tag: "Dining", slug: "mocktails-drinks-in-indian-food" },
  { title: "Indian Fine Dining near Circular Quay", excerpt: "Circular Quay offers more than scenic views and iconic landmarks — it's also home to some of Sydney's finest dining experiences.", date: "Jun 30, 2025", tag: "Local", slug: "indian-fine-dining-circular-quay" },
  { title: "Top Restaurants for Group Dining in Pyrmont", excerpt: "Pyrmont is one of Sydney's most sought-after dining destinations, especially for group gatherings and corporate events.", date: "Jun 27, 2025", tag: "Dining", slug: "group-dining-restaurants-pyrmont" },
  { title: "Best Indian Food in Surry Hills", excerpt: "Surry Hills is one of Sydney's most dynamic food destinations, and its Indian restaurant scene is particularly impressive.", date: "Jun 26, 2025", tag: "Local", slug: "best-indian-food-surry-hills" },
  { title: "Top Vegetarian-Friendly Restaurants near Chippendale", excerpt: "Chippendale and its surrounding areas have become a popular hub for diverse and inclusive dining options in Sydney.", date: "Jun 26, 2025", tag: "Dining", slug: "vegetarian-restaurants-chippendale" },
  { title: "The 25 Best Vegetarian Restaurants in Sydney", excerpt: "Sydney's vegetarian food scene has truly flourished in recent years, with an incredible range of plant-forward dining options.", date: "May 1, 2025", tag: "Dining", slug: "best-vegetarian-restaurants-in-sydney" },
  { title: "Best Indian Restaurant in Darling Harbour", excerpt: "Darling Harbour is one of Sydney's most iconic spots, and it's also a great place to experience authentic Indian cuisine.", date: "Jun 24, 2025", tag: "Local", slug: "indian-restaurant-darling-harbour" },
  { title: "How to Choose the Right Indian Catering for Your Sydney Event", excerpt: "Planning a successful event in Sydney requires more than a good guest list — the right catering is essential.", date: "Jun 23, 2025", tag: "Catering", slug: "find-right-indian-catering-for-event" },
  { title: "Top 5 Indian Dishes You Must Try in Sydney", excerpt: "Explore Sydney's most beloved Indian dishes, curated by dietary preference and flavour profile.", date: "Jun 23, 2025", tag: "Dining", slug: "top-5-indian-dishes-sydney" },
  { title: "18 Best Restaurants in Sydney for Lunch", excerpt: "We know that picking what to have for lunch can be a difficult choice, with so many incredible options across the city.", date: "May 5, 2025", tag: "Dining", slug: "best-restaurants-sydney-lunch" },
  { title: "20 Best Indian Restaurant in Sydney", excerpt: "This article is a must read if you are looking for a mouth-watering Indian dining experience anywhere in Sydney.", date: "May 2, 2025", tag: "Dining", slug: "best-indian-restaurant-sydney" },
  { title: "18 Best Group Restaurant in Sydney", excerpt: "Do you want to find the best group restaurant in Sydney? Whether you're planning a birthday, work dinner, or family gathering.", date: "May 2, 2025", tag: "Dining", slug: "best-group-restaurant-sydney" },
  { title: "17 Best Asian Restaurants in Sydney", excerpt: "All around Sydney, you will find a wealth of tradition consisting of traditional Chinese, the spice routes of India, and much more.", date: "May 1, 2025", tag: "Dining", slug: "best-asian-restaurants-in-sydney" },
  { title: "18 Best Asian Fusion Restaurants In Sydney", excerpt: "Asian fusion dining has taken Sydney by storm — blending bold flavours, inventive techniques, and cultural traditions.", date: "May 1, 2025", tag: "Dining", slug: "asian-fusion-restaurants-in-sydney" },
  { title: "15 Best Corporate Catering Services in Sydney", excerpt: "Planning a corporate event, office lunch, or business meeting in Sydney? The right catering service can elevate everything.", date: "Apr 30, 2025", tag: "Catering", slug: "best-corporate-catering-services-sydney" },
  { title: "25 Best Wedding Caterers in Sydney", excerpt: "Choosing the right caterer is essential to making your wedding day perfect. Sydney offers a diverse range of options.", date: "Apr 30, 2025", tag: "Catering", slug: "best-wedding-caterers-sydney" },
  { title: "15 Best Birthday Party Caterer in Sydney", excerpt: "When it comes to celebrating special moments, choosing the right birthday party caterers in Sydney makes all the difference.", date: "Apr 30, 2025", tag: "Catering", slug: "best-birthday-party-caterer-sydney" },
  { title: "15 Best Mother's Day Restaurant in Sydney", excerpt: "Mother's Day is just around the corner and it's time to start planning how to show your appreciation in the most special way.", date: "Apr 29, 2025", tag: "Events", slug: "best-mothers-day-restaurant-sydney" },
  { title: "20 Best Vivid Restaurant in Sydney", excerpt: "If you're looking for a unique dining experience during Vivid Sydney, then be sure to check out The Grand Palace.", date: "Apr 22, 2025", tag: "Events", slug: "best-vivid-restaurant-sydney" },
  { title: "Business Lunch Sydney CBD: Impress Clients at The Grand Palace", excerpt: "Sydney CBD's finest venue for a client business lunch — palace-inspired private dining, HACCP-certified catering, and every dietary requirement covered.", date: "Aug 11, 2026", tag: "Catering", slug: "business-lunch-sydney-cbd" },
  { title: "Wedding Venue Hire Sydney CBD — The Grand Palace, Up to 125 Guests", excerpt: "The Grand Palace's Basement restaurant at 261 George Street seats up to 125 guests for wedding receptions — HACCP certified, Gold Licensed, with external venue catering also available.", date: "Aug 11, 2026", tag: "Events", slug: "wedding-catering-sydney-cbd" },
  { title: "Your Complete Guide to Indian Whisky in Sydney", excerpt: "India's finest single malts — Amrut, Rampur and Indri — poured alongside authentic Indian food at The Grand Palace, Sydney CBD.", date: "29 July 2026", tag: "Dining", slug: "guide-to-indian-whisky-in-sydney" },
];

// Slugs that live under /blog instead of /guides — every guide whose DB
// guideType is "normal" (single-column informational article), as opposed to
// "listicle" (ranked/comparison guides, which stay on /guides). Guides that
// only exist in the static guidesContent bundle (no DB row) predate the
// guideType field entirely and are always listicle-style, so none of those
// belong here — see the guideType comment in blog.$slug.tsx / guides.$slug.tsx.
// Kept as a single source of truth so /guides and /blog can't drift apart.
export const BLOG_SLUGS: string[] = [
  "private-corporate-dining-sydney-cbd",
  "best-indian-birthday-dinner-sydney-where-to-celebrate-in-style",
  "best-indian-restaurant-near-me-sydney-cbd-the-grand-palace-guide",
  "how-to-plan-office-lunch-catering-in-sydney",
  "business-lunch-sydney-cbd",
  "private-event-venue-hire-sydney",
  "indian-catering-box-sydney-cbd",
  "christmas-corporate-catering-box-by-tgp",
  "why-tgp-best-for-christmas-lunch-and-dinner",
  "mocktails-drinks-in-indian-food",
  "indian-restaurant-near-wynyard-station-sydney",
  "make-birthday-memorable-with-tgp",
  "find-right-indian-catering-for-event",
  "catering-boxes-in-sydney-for-parties",
  "why-tgp-is-best-for-diwali-party",
  "tgp-is-best-for-a-weekend-indian-lunch",
  "guide-to-indian-whisky-in-sydney",
  "wedding-catering-sydney-cbd",
  "jain-restaurants-in-sydney-no-onion-no-garlic",
  "best-birthday-venues-sydney-cbd",
  "indian-wedding-catering-sydney",
  "indian-food-delivery-sydney-cbd",
  "indian-restaurant-near-martin-place",
  "indian-restaurant-near-town-hall-station",
  "top-5-indian-dishes-sydney",
];
