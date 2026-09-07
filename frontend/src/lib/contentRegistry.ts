// Single source of truth for every editable field on every page. Drives the
// admin Content editor (it renders one input per field) AND documents exactly
// which keys each page's JSX wires via makeContent(). A field only belongs
// here once its page actually reads it — otherwise an editor could "save" a
// value that never appears on the live page. `fallback` mirrors the exact
// default string baked into the page's own c("key", "default") call so the
// admin box always shows the real current text instead of an empty box.
export type FieldType = "text" | "textarea" | "image";
export type ContentField = { key: string; label: string; type: FieldType; group?: string; fallback?: string };
export type PageContentDef = { path: string; label: string; fields: ContentField[] };

export const CONTENT_REGISTRY: PageContentDef[] = [
  {
    path: "/about",
    label: "About Us",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.kicker", label: "Hero kicker", type: "text", group: "Hero", fallback: "The Grand Palace · Sydney CBD" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "About Us" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "text", group: "Hero", fallback: "Fine Dining Indian Restaurant · Est. Sydney CBD" },

      { key: "story.kicker", label: "Story kicker", type: "text", group: "Our Story", fallback: "Our Story" },
      { key: "story.headingLine1", label: "Story heading (line 1)", type: "text", group: "Our Story", fallback: "Fine Dining Indian" },
      { key: "story.headingLine2", label: "Story heading (italic line 2)", type: "text", group: "Our Story", fallback: "Restaurant" },
      { key: "story.body", label: "Story paragraphs (blank line between)", type: "textarea", group: "Our Story", fallback:
        "The Grand Palace Indian Restaurant is serving traditional Indian food that is rich, plentiful and meticulously prepared. India's culinary heritage features distinct regional cuisines found throughout the country — and we bring these authentic flavours to Sydney's dining community.\n\nOur kitchen employs experienced chefs who blend spices with aromatic herbs using time-honoured techniques passed down through generations. Every dish is crafted with care, celebrating the bold regional flavours of the Indian subcontinent.\n\nThe restaurant's interior design draws inspiration from India's royal palaces, creating an opulent atmosphere that reflects historical regal aesthetics — making every visit a truly immersive experience." },
      { key: "story.image", label: "Story image", type: "image", group: "Our Story" },

      { key: "vision.kicker", label: "Vision kicker", type: "text", group: "Our Vision", fallback: "Our Vision" },
      { key: "vision.quote", label: "Vision quote", type: "textarea", group: "Our Vision", fallback: "\"We are supremely confident that our sublime food set in an ostentatious environment supported by attentive service will satiate your desire to have a unique dining experience.\"" },

      { key: "diff.kicker", label: "Difference kicker", type: "text", group: "The Difference", fallback: "What Sets Us Apart" },
      { key: "diff.heading", label: "Difference heading", type: "text", group: "The Difference", fallback: "The Grand Palace <span class=\"italic text-saffron\">difference</span>" },

      { key: "diff.tile1.title", label: "Tile 1 title", type: "text", group: "Difference Tiles", fallback: "Royal Ambience" },
      { key: "diff.tile1.body", label: "Tile 1 body", type: "textarea", group: "Difference Tiles", fallback: "Hand-carved arches, golden light and opulent décor inspired by India's historic royal palaces — no extra decoration needed." },
      { key: "diff.tile2.title", label: "Tile 2 title", type: "text", group: "Difference Tiles", fallback: "Authentic Regional Cuisine" },
      { key: "diff.tile2.body", label: "Tile 2 body", type: "textarea", group: "Difference Tiles", fallback: "Experienced chefs craft traditional recipes from across India's diverse culinary regions, using the finest spices and aromatic herbs." },
      { key: "diff.tile3.title", label: "Tile 3 title", type: "text", group: "Difference Tiles", fallback: "HACCP Certified Kitchen" },
      { key: "diff.tile3.body", label: "Tile 3 body", type: "textarea", group: "Difference Tiles", fallback: "Gold-licensed and HACCP certified — our kitchen meets the highest food safety and hygiene standards in Australia." },
      { key: "diff.tile4.title", label: "Tile 4 title", type: "text", group: "Difference Tiles", fallback: "Customisable Menus" },
      { key: "diff.tile4.body", label: "Tile 4 body", type: "textarea", group: "Difference Tiles", fallback: "Vegetarian, vegan, halal, and gluten-friendly options available. Menus tailored to your event, taste, and dietary requirements." },
      { key: "diff.tile5.title", label: "Tile 5 title", type: "text", group: "Difference Tiles", fallback: "Heart of Sydney CBD" },
      { key: "diff.tile5.body", label: "Tile 5 body", type: "textarea", group: "Difference Tiles", fallback: "Basement, 261 George Street — one minute from Wynyard Station and Bridge Street Light Rail, with parking nearby." },
      { key: "diff.tile6.title", label: "Tile 6 title", type: "text", group: "Difference Tiles", fallback: "Private Event Specialists" },
      { key: "diff.tile6.body", label: "Tile 6 body", type: "textarea", group: "Difference Tiles", fallback: "From intimate birthday dinners to full venue takeovers, our dedicated team handles every detail of your special occasion." },

      { key: "cta.heading", label: "CTA heading", type: "text", group: "Bottom CTA", fallback: "Come Dine With Us" },
      { key: "cta.subtext", label: "CTA subtext", type: "text", group: "Bottom CTA", fallback: "Experience authentic Indian fine dining in the heart of Sydney CBD." },
    ],
  },
  {
    path: "/contact",
    label: "Contact",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.kicker", label: "Hero kicker", type: "text", group: "Hero", fallback: "The Grand Palace · Sydney CBD" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Contact Us" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "text", group: "Hero", fallback: "We're here to help" },
      { key: "info.heading", label: "Get In Touch heading", type: "text", group: "Info Panel", fallback: "Get In Touch" },
      { key: "info.text", label: "Get In Touch text", type: "textarea", group: "Info Panel", fallback: "We'd love to hear from you. Fill in the form and one of our team will be in touch shortly." },
    ],
  },
  {
    path: "/events",
    label: "Events",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "textarea", group: "Hero", fallback: "Where Sydney\ncomes to celebrate" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "Plan your next birthday, anniversary or work dinner at The Grand Palace. Book the whole venue over the weekend for ultimate privacy — or just a section. The choice is yours." },
      { key: "corp.heading", label: "Corporate heading", type: "text", group: "Corporate Functions", fallback: "Where business meets bold flavour" },
      { key: "corp.body1", label: "Corporate paragraph 1", type: "textarea", group: "Corporate Functions", fallback: "The Grand Palace offers a sophisticated yet inviting atmosphere for corporate gatherings of all kinds. From intimate boardroom dinners to large EOFY celebrations, our team handles every detail — so you can focus on your guests." },
      { key: "corp.body2", label: "Corporate paragraph 2", type: "textarea", group: "Corporate Functions", fallback: "Our chefs craft traditional Indian recipes with bold regional flavours, using the finest ingredients. Menus are fully customisable to suit dietary requirements, themes, and budgets. Halal certified, HACCP approved." },
      { key: "private.heading", label: "Private events heading", type: "text", group: "Private Events", fallback: "Your milestone, our grand stage" },
      { key: "private.body1", label: "Private events paragraph 1", type: "textarea", group: "Private Events", fallback: "Our experienced team ensures seamless service and a memorable dining experience for every private occasion. Whether you're planning an intimate dinner for 20 or a grand celebration for 125, we handle every detail so you can be present in the moment." },
      { key: "private.body2", label: "Private events paragraph 2", type: "textarea", group: "Private Events", fallback: "Fully customisable menus — vegetarian, vegan, gluten-friendly and halal options available. Our chefs craft traditional Indian recipes with bold regional flavours, tailored to your theme, taste and budget." },
      { key: "birthday.heading", label: "Birthday heading", type: "text", group: "Birthday Celebrations", fallback: "Your birthday, our grand celebration" },
      { key: "birthday.body1", label: "Birthday paragraph 1", type: "textarea", group: "Birthday Celebrations", fallback: "Celebrate your birthday in style beneath hand-carved arches and warm golden light. Whether you're planning a quiet dinner for twelve or a grand party for the whole venue, our team makes every detail magical." },
      { key: "birthday.body2", label: "Birthday paragraph 2", type: "textarea", group: "Birthday Celebrations", fallback: "Our TGP Decoration & Cake Package starts from just $150 — includes an 8-inch customised birthday cake, 25 balloons, a birthday banner, props and a heartfelt birthday song performed by our team." },
    ],
  },
  {
    path: "/gallery",
    label: "Gallery",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Our Gallery" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "text", group: "Hero", fallback: "Food · Moments · Ambience" },
    ],
  },
  {
    path: "/gift-card",
    label: "Gift Card",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Gift Vouchers" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "Give your loved ones the gift of an unforgettable Indian dining experience" },
      { key: "intro.heading", label: "Intro heading", type: "text", group: "Intro", fallback: "Give the gift of flavour" },
      { key: "intro.body1", label: "Intro paragraph 1", type: "textarea", group: "Intro", fallback: "Looking for the perfect gift? The Grand Palace Indian Restaurant gift vouchers make every celebration extra special. Whether it's a birthday, anniversary, or a simple thank you, let your loved ones choose what they truly want." },
      { key: "intro.body2", label: "Intro paragraph 2", type: "textarea", group: "Intro", fallback: "Easy to purchase online and even easier to enjoy — treat someone to an authentic Indian fine dining experience in the heart of Sydney CBD." },
      { key: "terms.list", label: "Important Information (one per line)", type: "textarea", group: "Important Information", fallback: "Gift vouchers are non-exchangeable and non-refundable.\nVouchers are invalid on public holidays, Valentine's Day, Mother's Day, Father's Day, Diwali, and New Year's Eve.\nRedemption in combination with other offers is at the restaurant's discretion.\nPurchase constitutes agreement to receive marketing communications from The Grand Palace.\n10% surcharge applies on special events and public holidays." },
    ],
  },
  {
    path: "/career",
    label: "Careers",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.kicker", label: "Hero kicker", type: "text", group: "Hero", fallback: "Join Our Team" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Careers" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "text", group: "Hero", fallback: "Be part of Sydney's finest Indian dining experience" },
      { key: "intro.body", label: "Intro paragraph", type: "textarea", group: "Intro", fallback: "We are a family-run Indian restaurant in Sydney's CBD, serving traditional cuisine meticulously prepared in an upscale setting modelled after India's royal palaces. We welcome enthusiastic individuals who are passionate about authentic Indian cooking and eager to grow with our team." },
    ],
  },
  {
    path: "/book-a-table",
    label: "Book a Table",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Come and Dine With Us" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "The most authentic Indian food in Sydney CBD. Reserve instantly online, or call us directly — our team responds within 24 hours." },
    ],
  },
  {
    path: "/office-catering",
    label: "Office Catering",
    fields: [
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Office Catering Sydney CBD" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "Fresh Indian platter boxes from $75 per box. Full Catering Service at your office premise for group sizes of 20 and above" },

      { key: "menusection.heading", label: "Menu section heading", type: "text", group: "Catering Menu", fallback: "Our catering menu" },
      { key: "menusection.subtitle", label: "Menu section subtitle", type: "textarea", group: "Catering Menu", fallback: "Our menu celebrates the rich traditions of Indian cuisine while offering flexibility to customise for diverse corporate needs." },
      { key: "menusection.item1.title", label: "Menu category 1 title", type: "text", group: "Catering Menu", fallback: "Traditional Indian Curries" },
      { key: "menusection.item1.desc", label: "Menu category 1 desc", type: "textarea", group: "Catering Menu", fallback: "Rich, aromatic, and full of flavour — from mild Butter Chicken to bold Lamb Rogan Josh." },
      { key: "menusection.item2.title", label: "Menu category 2 title", type: "text", group: "Catering Menu", fallback: "Entrées & Finger Foods" },
      { key: "menusection.item2.desc", label: "Menu category 2 desc", type: "textarea", group: "Catering Menu", fallback: "Perfect for meetings, conferences and networking — samosas, tikkas, kebabs and more." },
      { key: "menusection.item3.title", label: "Menu category 3 title", type: "text", group: "Catering Menu", fallback: "Dietary-Friendly Options" },
      { key: "menusection.item3.desc", label: "Menu category 3 desc", type: "textarea", group: "Catering Menu", fallback: "Vegetarian, vegan, gluten-friendly and halal options available across the full menu." },
      { key: "menusection.item4.title", label: "Menu category 4 title", type: "text", group: "Catering Menu", fallback: "Desserts & Indian Sweets" },
      { key: "menusection.item4.desc", label: "Menu category 4 desc", type: "textarea", group: "Catering Menu", fallback: "An indulgent finish to any corporate occasion — Gulab Jamun, Ras Malai, Kulfi and more." },

      { key: "whyus.heading", label: "Why Us heading", type: "text", group: "Why Choose Us", fallback: "Why choose The Grand Palace?" },
      { key: "whyus.item1.title", label: "Why Us 1 title", type: "text", group: "Why Choose Us", fallback: "Sydney CBD Location" },
      { key: "whyus.item1.desc", label: "Why Us 1 desc", type: "textarea", group: "Why Choose Us", fallback: "Basement, 261 George St — 2 min from Wynyard Station. Easy access for CBD delivery and pickup." },
      { key: "whyus.item2.title", label: "Why Us 2 title", type: "text", group: "Why Choose Us", fallback: "HACCP Certified" },
      { key: "whyus.item2.desc", label: "Why Us 2 desc", type: "textarea", group: "Why Choose Us", fallback: "All food prepared in our certified kitchen to the highest food safety and quality standards." },
      { key: "whyus.item3.title", label: "Why Us 3 title", type: "text", group: "Why Choose Us", fallback: "We Come to You" },
      { key: "whyus.item3.desc", label: "Why Us 3 desc", type: "textarea", group: "Why Choose Us", fallback: "Our team arrives with freshly cooked food, sets everything up in your office, and cleans up after." },
      { key: "whyus.item4.title", label: "Why Us 4 title", type: "text", group: "Why Choose Us", fallback: "Tailored Menus" },
      { key: "whyus.item4.desc", label: "Why Us 4 desc", type: "textarea", group: "Why Choose Us", fallback: "Fully customisable menus to suit your team size, dietary requirements and event style." },
      { key: "whyus.item5.title", label: "Why Us 5 title", type: "text", group: "Why Choose Us", fallback: "4.4★ Google Rated" },
      { key: "whyus.item5.desc", label: "Why Us 5 desc", type: "textarea", group: "Why Choose Us", fallback: "Trusted by Sydney's top businesses. 1,000+ Google reviews from happy customers." },
      { key: "whyus.item6.title", label: "Why Us 6 title", type: "text", group: "Why Choose Us", fallback: "Platter Boxes from $75" },
      { key: "whyus.item6.desc", label: "Why Us 6 desc", type: "textarea", group: "Why Choose Us", fallback: "Order online, pay securely, and collect from our George Street kitchen or arrange CBD delivery." },
    ],
  },
  {
    path: "/venue-catering",
    label: "Venue Catering",
    fields: [
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Luxury Catering at Your Venue" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "HACCP Certified · Engagements · Weddings · Birthdays · Anniversaries" },

      { key: "occasions.heading", label: "Occasions heading", type: "text", group: "Occasions", fallback: "What are you celebrating?" },
      { key: "occasions.subtitle", label: "Occasions subtitle", type: "textarea", group: "Occasions", fallback: "We specialise in luxury event catering across Sydney and NSW for every milestone and occasion." },
      { key: "occasions.item1.title", label: "Occasion 1 title", type: "text", group: "Occasions", fallback: "Engagements" },
      { key: "occasions.item1.desc", label: "Occasion 1 desc", type: "textarea", group: "Occasions", fallback: "Make the announcement unforgettable. We craft tailored menus and deliver restaurant-quality service at your chosen venue." },
      { key: "occasions.item2.title", label: "Occasion 2 title", type: "text", group: "Occasions", fallback: "Weddings" },
      { key: "occasions.item2.desc", label: "Occasion 2 desc", type: "textarea", group: "Occasions", fallback: "From intimate ceremonies to grand receptions — elegant canapés, grazing tables or multi-course banquets for your special day." },
      { key: "occasions.item3.title", label: "Occasion 3 title", type: "text", group: "Occasions", fallback: "Baby Showers" },
      { key: "occasions.item3.desc", label: "Occasion 3 desc", type: "textarea", group: "Occasions", fallback: "A warm, beautifully catered celebration welcoming new arrivals. Customised menus with vegetarian, vegan and halal options." },
      { key: "occasions.item4.title", label: "Occasion 4 title", type: "text", group: "Occasions", fallback: "Birthday Celebrations" },
      { key: "occasions.item4.desc", label: "Occasion 4 desc", type: "textarea", group: "Occasions", fallback: "Premium Indian catering delivered to your venue. Let us handle the food while you celebrate with the people who matter most." },
      { key: "occasions.item5.title", label: "Occasion 5 title", type: "text", group: "Occasions", fallback: "Anniversaries" },
      { key: "occasions.item5.desc", label: "Occasion 5 desc", type: "textarea", group: "Occasions", fallback: "Mark your milestone years with a feast worthy of the occasion — rich, aromatic Indian cuisine served at your location." },
      { key: "occasions.item6.title", label: "Occasion 6 title", type: "text", group: "Occasions", fallback: "Any Celebration" },
      { key: "occasions.item6.desc", label: "Occasion 6 desc", type: "textarea", group: "Occasions", fallback: "Farewells, reunions, corporate events, festive gatherings — we cater for any occasion across Sydney and NSW." },

      { key: "formats.heading", label: "Formats heading", type: "text", group: "Menu Formats", fallback: "Choose your format" },
      { key: "formats.subtitle", label: "Formats subtitle", type: "textarea", group: "Menu Formats", fallback: "Our catering menu celebrates the rich traditions of Indian cuisine with the flexibility to customise for any event style." },
      { key: "formats.item1.title", label: "Format 1 title", type: "text", group: "Menu Formats", fallback: "Canapés & Finger Food" },
      { key: "formats.item1.desc", label: "Format 1 desc", type: "textarea", group: "Menu Formats", fallback: "Perfect for cocktail parties and networking events — bite-sized Indian delights passed by our professional wait staff." },
      { key: "formats.item2.title", label: "Format 2 title", type: "text", group: "Menu Formats", fallback: "Grazing Tables" },
      { key: "formats.item2.desc", label: "Format 2 desc", type: "textarea", group: "Menu Formats", fallback: "Stunning spreads of Indian mezze, chutneys, breads and snacks that create a centrepiece and a conversation starter." },
      { key: "formats.item3.title", label: "Format 3 title", type: "text", group: "Menu Formats", fallback: "Buffet Banquets" },
      { key: "formats.item3.desc", label: "Format 3 desc", type: "textarea", group: "Menu Formats", fallback: "Abundant spreads of curries, rice, breads, entrées and desserts — ideal for relaxed celebrations and large groups." },
      { key: "formats.item4.title", label: "Format 4 title", type: "text", group: "Menu Formats", fallback: "Multi-Course Fine Dining" },
      { key: "formats.item4.desc", label: "Format 4 desc", type: "textarea", group: "Menu Formats", fallback: "A curated, restaurant-quality dining experience delivered to your venue — entrée, mains, staples and dessert, served by our team." },

      { key: "handle.heading", label: "'We handle everything' heading", type: "text", group: "Full-Service", fallback: "We handle everything" },
      { key: "handle.body", label: "'We handle everything' body", type: "textarea", group: "Full-Service", fallback: "Our team arrives at your venue with freshly prepared food and handles the complete setup, service and pack-down — delivering a seamless, stress-free experience so you can focus entirely on your guests." },

      { key: "whyus.heading", label: "Why Us heading", type: "text", group: "Why Choose Us", fallback: "Why choose The Grand Palace?" },
      { key: "whyus.item1.title", label: "Why Us 1 title", type: "text", group: "Why Choose Us", fallback: "HACCP Certified" },
      { key: "whyus.item1.desc", label: "Why Us 1 desc", type: "textarea", group: "Why Choose Us", fallback: "All food prepared in our certified kitchen with annual external audits — the highest food safety standards, every time." },
      { key: "whyus.item2.title", label: "Why Us 2 title", type: "text", group: "Why Choose Us", fallback: "Tailored Menus" },
      { key: "whyus.item2.desc", label: "Why Us 2 desc", type: "textarea", group: "Why Choose Us", fallback: "Our chefs design custom menus for your occasion — from mild and approachable to bold regional flavours." },
      { key: "whyus.item3.title", label: "Why Us 3 title", type: "text", group: "Why Choose Us", fallback: "We Come to You" },
      { key: "whyus.item3.desc", label: "Why Us 3 desc", type: "textarea", group: "Why Choose Us", fallback: "Our professional team delivers, sets up and serves at your chosen venue anywhere across Sydney and NSW." },
      { key: "whyus.item4.title", label: "Why Us 4 title", type: "text", group: "Why Choose Us", fallback: "Any Group Size" },
      { key: "whyus.item4.desc", label: "Why Us 4 desc", type: "textarea", group: "Why Choose Us", fallback: "From intimate gatherings to large events of 200+ guests — we scale to your exact needs." },
      { key: "whyus.item5.title", label: "Why Us 5 title", type: "text", group: "Why Choose Us", fallback: "Dietary Inclusive" },
      { key: "whyus.item5.desc", label: "Why Us 5 desc", type: "textarea", group: "Why Choose Us", fallback: "Vegetarian, vegan, gluten-friendly and halal options built into every menu as standard." },
      { key: "whyus.item6.title", label: "Why Us 6 title", type: "text", group: "Why Choose Us", fallback: "4.4★ Google Rated" },
      { key: "whyus.item6.desc", label: "Why Us 6 desc", type: "textarea", group: "Why Choose Us", fallback: "Trusted by hundreds of Sydney families and businesses. 1,000+ five-star reviews." },

      { key: "gallery.heading", label: "Gallery heading", type: "text", group: "Food Gallery", fallback: "Restaurant quality, at your venue" },
    ],
  },
  {
    path: "/venue-for-hire",
    label: "Venue for Hire",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Private Venue for Hire" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "Up to 125 guests · From $45 per person · Saturday & Sunday lunches" },
    ],
  },
  {
    path: "/set-menu",
    label: "Set Menu",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
    ],
  },
  {
    path: "/beverages",
    label: "Beverages",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
    ],
  },
  {
    path: "/lunch-special",
    label: "Lunch Special",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "halka.name", label: "Halka card name", type: "text", group: "Pricing Cards", fallback: "Halka" },
      { key: "halka.tagline", label: "Halka tagline", type: "text", group: "Pricing Cards", fallback: "Light" },
      { key: "halka.price", label: "Halka price", type: "text", group: "Pricing Cards", fallback: "$35" },
      { key: "fulka.name", label: "Fulka card name", type: "text", group: "Pricing Cards", fallback: "Fulka" },
      { key: "fulka.tagline", label: "Fulka tagline", type: "text", group: "Pricing Cards", fallback: "Wholesome" },
      { key: "fulka.price", label: "Fulka price", type: "text", group: "Pricing Cards", fallback: "$45" },
      { key: "bhari.name", label: "Bhari card name", type: "text", group: "Pricing Cards", fallback: "Bhari" },
      { key: "bhari.tagline", label: "Bhari tagline", type: "text", group: "Pricing Cards", fallback: "Bountiful Feast" },
      { key: "bhari.price", label: "Bhari price", type: "text", group: "Pricing Cards", fallback: "$60" },
    ],
  },
  {
    path: "/menu",
    label: "Menu Hub",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "intro.text", label: "Intro text", type: "textarea", group: "Intro", fallback: "Discover our rich selection of à la carte dishes, Set Menus, and refreshing Beverages — crafted to give you a truly royal dining experience." },
      { key: "welcome.heading", label: "Welcome heading", type: "text", group: "Welcome", fallback: "Dine in The Grand Palace - Indian Restaurant Sydney CBD" },
      { key: "welcome.body", label: "Welcome body", type: "textarea", group: "Welcome", fallback: "The Grand Palace - Indian Restaurant brings the most authentic Indian cuisine to Australian shores. Our chefs prepare fresh curries every day, full of bold flavour. Our carefully crafted interior is a reminiscence of glamorous majestic palaces of India — and our attentive service is here to offer you an unforgettable dining experience." },
    ],
  },
  {
    path: "/menu/a-la-carte",
    label: "À la Carte Menu",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
    ],
  },
  {
    path: "/whats-on",
    label: "What's On",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "What's On" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "text", group: "Hero", fallback: "Latest offers, deals & events" },
    ],
  },
  {
    path: "/guides",
    label: "Guides",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Dining Guides" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "text", group: "Hero", fallback: "Your ultimate guide to Sydney's finest Indian dining experience" },
    ],
  },
  {
    path: "/terms",
    label: "Terms & Conditions",
    fields: [
      { key: "hero.title", label: "Hero title", type: "text", group: "Hero", fallback: "Terms & Conditions" },
      { key: "intro.text", label: "Intro text", type: "textarea", group: "Intro", fallback: "Last updated: 2025. These terms apply to all dine-in guests and online customers of The Grand Palace Indian Restaurant, Basement, 261 George Street, Sydney, NSW 2000." },

      { key: "definitions.title", label: "Section 1 title", type: "text", group: "Legal Sections", fallback: "Definitions" },
      { key: "definitions.body", label: "Section 1 body", type: "textarea", group: "Legal Sections", fallback: "\"We\", \"us\", and \"our\" refer to The Grand Palace – Indian Restaurant at Basement, 261 George Street, Sydney, NSW 2000. The restaurant reserves the right to revise these terms without prior notice." },
      { key: "kitchen.title", label: "Section 2 title", type: "text", group: "Legal Sections", fallback: "Kitchen Closing Time" },
      { key: "kitchen.body", label: "Section 2 body", type: "textarea", group: "Legal Sections", fallback: "The kitchen closes 30 minutes before restaurant closing. Specific hours include:" },
      { key: "privacy.title", label: "Section 3 title", type: "text", group: "Legal Sections", fallback: "Privacy Policy" },
      { key: "privacy.body", label: "Section 3 body", type: "textarea", group: "Legal Sections", fallback: "The establishment states: \"Information we receive from your use of our physical premise and digital media is used only to provide the best service.\"" },
      { key: "onlinepayment.title", label: "Section 4 title", type: "text", group: "Legal Sections", fallback: "Online Payment" },
      { key: "onlinepayment.body", label: "Section 4 body", type: "textarea", group: "Legal Sections", fallback: "Payment details are processed securely through a gateway partner and discarded after order completion. Card details are not retained." },
      { key: "premisepayment.title", label: "Section 5 title", type: "text", group: "Legal Sections", fallback: "Physical Premise Payment" },
      { key: "premisepayment.body", label: "Section 5 body", type: "textarea", group: "Legal Sections", fallback: "Payment terminals process cards without the restaurant retaining card information." },
      { key: "legalrights.title", label: "Section 6 title", type: "text", group: "Legal Sections", fallback: "Legal Rights" },
      { key: "legalrights.body", label: "Section 6 body", type: "textarea", group: "Legal Sections", fallback: "The restaurant may disclose information to satisfy legal obligations or protect business interests and guest safety." },
      { key: "foodquality.title", label: "Section 7 title", type: "text", group: "Legal Sections", fallback: "Food Quality" },
      { key: "foodquality.body", label: "Section 7 body", type: "textarea", group: "Legal Sections", fallback: "The restaurant notes: \"Our dishes contain oil. If the customers don't like the oily food, it can't be held against us.\"" },
      { key: "returns.title", label: "Section 8 title", type: "text", group: "Legal Sections", fallback: "Returns Policy" },
      { key: "returns.body", label: "Section 8 body", type: "textarea", group: "Legal Sections", fallback: "No refunds on gift cards or items due to taste preferences. Incorrect or faulty products are replaced at no cost." },
      { key: "disclaimer.title", label: "Section 9 title", type: "text", group: "Legal Sections", fallback: "Disclaimer" },
      { key: "disclaimer.body", label: "Section 9 body", type: "textarea", group: "Legal Sections", fallback: "Website content is provided \"as is\" with no warranties. The business disclaims liability for losses related to website information." },
      { key: "giftcardterms.title", label: "Section 10 title", type: "text", group: "Legal Sections", fallback: "Gift Card Terms" },
      { key: "giftcardterms.body", label: "Section 10 body", type: "textarea", group: "Legal Sections", fallback: "Gift cards require subscription to marketing communications and are invalid on public holidays and special event days at the restaurant's discretion." },
    ],
  },
  {
    path: "/birthday-package",
    label: "Birthday Package",
    fields: [
      { key: "hero.image", label: "Hero background image", type: "image", group: "Hero" },
      { key: "hero.title", label: "Hero title", type: "textarea", group: "Hero", fallback: "Celebrate Birthday in Sydney at\nThe Grand Palace Indian Restaurant" },
      { key: "hero.subtitle", label: "Hero subtitle", type: "textarea", group: "Hero", fallback: "Cake, Decorations, and Songs are on us — celebrations and everlasting moments are on you." },
    ],
  },
];

export function pageDef(path: string): PageContentDef | undefined {
  return CONTENT_REGISTRY.find((p) => p.path === path);
}
