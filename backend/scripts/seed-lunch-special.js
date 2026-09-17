// One-time migration: moves the Lunch Special Set Menu from hardcoded data
// in frontend/src/routes/lunch-special.tsx into the database, the same way
// Set Menu already works, so it becomes editable from Admin → Menu and shows
// up in the admin's menu-type tab list (which is driven entirely by whatever
// menuType values exist in MenuCategory — see backend/src/routes/menu.routes.js).
//
// Three categories (Halka/Fulka/Bhari) carry their "what's included" course
// list as MenuItems, same shape set-menu.tsx already reads (item.description
// = comma-separated dish list, item.extra.packagePrice/packageDesc/minimum).
// A fourth "menu-dishes" category holds the shared dish gallery (the "What's
// on the Menu" grid) as individual MenuItems tagged by extra.group, since
// those dishes aren't tied to any one tier.
//
// Run once: node scripts/seed-lunch-special.js
import { prisma } from "../src/db.js";

const MENU_TYPE = "lunch-special";

async function main() {
  const existing = await prisma.menuCategory.findFirst({ where: { menuType: MENU_TYPE } });
  if (existing) {
    console.log(`menuType "${MENU_TYPE}" already has data — aborting to avoid duplicates.`);
    process.exit(1);
  }

  const halka = await prisma.menuCategory.create({
    data: {
      menuType: MENU_TYPE,
      menuLabel: "Lunch Special",
      slug: "halka",
      label: "Halka",
      tag: "Solo Diner",
      imageUrl: null,
      active: true,
      sortOrder: 0,
    },
  });
  await prisma.menuItem.create({
    data: {
      categoryId: halka.id,
      name: "Main",
      description: "1 Curry (veg or non-veg), Assorted Breads, Basmati Rice",
      price: null,
      active: true,
      sortOrder: 0,
      extra: {
        packagePrice: "$35",
        packageDesc: "Light",
        minimum: "Perfect for a solo lunch break",
        entree: "Not included",
        main: "1 Curry (veg or non-veg)",
        staples: "Assorted Breads · Basmati Rice",
        dessert: "Not included",
      },
    },
  });

  const fulka = await prisma.menuCategory.create({
    data: {
      menuType: MENU_TYPE,
      menuLabel: "Lunch Special",
      slug: "fulka",
      label: "Fulka",
      tag: "Min 2 Guests",
      imageUrl: null,
      active: true,
      sortOrder: 1,
    },
  });
  await prisma.menuItem.create({
    data: {
      categoryId: fulka.id,
      name: "Full Set",
      description: "Entrée x2 (1 Veg + 1 Non-Veg), Curries x2 (1 Veg + 1 Non-Veg), Daal, Rice, Breads, Salad, Papadum, Gulab Jamun",
      price: null,
      active: true,
      sortOrder: 0,
      extra: {
        packagePrice: "$45",
        packageDesc: "Wholesome",
        minimum: "Unlimited curries, rice & staples",
        entree: "1 Veg + 1 Non-Veg",
        curries: "1 Veg + 1 Non-Veg",
        daal: "Chef's choice",
        staples: "Rice · Breads · Salad · Papadum",
        dessert: "Gulab Jamun",
      },
    },
  });

  const bhari = await prisma.menuCategory.create({
    data: {
      menuType: MENU_TYPE,
      menuLabel: "Lunch Special",
      slug: "bhari",
      label: "Bhari",
      tag: "Min 2 Guests",
      imageUrl: null,
      active: true,
      sortOrder: 2,
    },
  });
  await prisma.menuItem.create({
    data: {
      categoryId: bhari.id,
      name: "Full Feast",
      description: "Entrée x4 (2 Veg + 2 Non-Veg), Curries x4 (2 Veg + 2 Non-Veg), Daal, Rice, Breads, Salad, Papadum, Gulab Jamun",
      price: null,
      active: true,
      sortOrder: 0,
      extra: {
        packagePrice: "$60",
        packageDesc: "Bountiful Feast",
        minimum: "Unlimited curries, rice & staples for the table",
        entree: "2 Veg + 2 Non-Veg",
        curries: "2 Veg + 2 Non-Veg",
        daal: "Chef's choice",
        staples: "Rice · Breads · Salad · Papadum",
        dessert: "Gulab Jamun",
      },
    },
  });

  // Shared dish gallery — the "What's on the Menu" grid, grouped by
  // extra.group ("veg-entree" | "veg-curry" | "nonveg-entree" | "nonveg-curry"
  // | "daal" | "dessert") so the frontend can re-split them into the same
  // veg/non-veg columns the hardcoded arrays used to define.
  const dishesCategory = await prisma.menuCategory.create({
    data: {
      menuType: MENU_TYPE,
      menuLabel: "Lunch Special",
      slug: "menu-dishes",
      label: "What's on the Menu",
      tag: null,
      imageUrl: null,
      active: true,
      sortOrder: 3,
    },
  });

  const dishes = [
    { name: "Paneer Schnitzel", img: "/dishes/PANEER-SCHNITZEL.png", group: "veg-entree" },
    { name: "Hariyali Kebab", img: "/dishes/HARIYALI-KEBAB.png", group: "veg-entree" },
    { name: "Samosa", img: "/dishes/TRIANGLE-SAMOSA.png", group: "veg-entree" },
    { name: "Onion Bhaji", img: "/dishes/ONION-BHAJI.png", group: "veg-entree" },
    { name: "Navratan Korma", img: "/dishes/Vegetables-Korma.png", group: "veg-curry" },
    { name: "Shahi Paneer", img: "/dishes/KADHAI-PANEER.png", group: "veg-curry" },
    { name: "Aloo Gobhi", img: "/dishes/Aloo-Gobhi.png", group: "veg-curry" },
    { name: "Bhindi Do Pyaza", img: "/dishes/BHINDI-DO-PYAZA.png", group: "veg-curry" },
    { name: "Murgh Abir Tikka", img: "/dishes/MURGH-ABEER-TIKKA.png", group: "nonveg-entree" },
    { name: "Saffron Chicken Tikka", img: "/dishes/Entree_Saffron-Chicken-Tikka_01-ri381p5s1zwap0rpedu6zn6dx5gkaxtcbcqyo272f4.jpg", group: "nonveg-entree" },
    { name: "Kakori Kebab", img: "/dishes/KAKORI-KEBAB.png", group: "nonveg-entree" },
    { name: "Semolina Crusted Prawns", img: "/dishes/SEMOLINA-CRUSTED-PRAWNS.png", group: "nonveg-entree" },
    { name: "Butter Chicken", img: "/dishes/BUTTER-CHICKEN.png", group: "nonveg-curry" },
    { name: "Chicken Tikka Masala", img: "/dishes/Mains_Chicken-Tikka-Masala_04-scaled-ri388vne9fq5dsc8gzkljby5a42i3pbiyw5hn5jsw0.jpg", group: "nonveg-curry" },
    { name: "Chicken Saag Wala", img: "/dishes/CHICKEN-SAAG-WALA-32.90.png", group: "nonveg-curry" },
    { name: "Kashmiri Rogan Josh", img: "/dishes/Kashmiri-Rogan-Josh.png", group: "nonveg-curry" },
    { name: "Masala Fish Curry", img: "/dishes/Masala-Fish-Curry.png", group: "nonveg-curry" },
    { name: "Lasooni Daal Tadka", img: "/dishes/LASOONI-DAAL-TADKA.png", group: "daal" },
    { name: "Daal Makhani", img: "/dishes/DAAL-MAKHANI.png", group: "daal" },
    { name: "Gulab Jamun", img: "/dishes/Dessert_Gulab-Jamun-ri38l5fjhkiwyiiitaj938gsh7l0lg1dbmrp77crnk.jpeg", group: "dessert" },
  ];

  for (const [i, d] of dishes.entries()) {
    await prisma.menuItem.create({
      data: {
        categoryId: dishesCategory.id,
        name: d.name,
        description: null,
        imageUrl: d.img,
        active: true,
        sortOrder: i,
        extra: { group: d.group },
      },
    });
  }

  console.log(`Seeded ${MENU_TYPE}: 3 package categories + ${dishes.length} dishes.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
