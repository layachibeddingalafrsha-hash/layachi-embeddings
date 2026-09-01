# Graph Report - Fath  (2026-08-30)

## Corpus Check
- 114 files · ~93,213 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 521 nodes · 810 edges · 56 communities (47 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Checkout & Meta Tracking
- Admin Dashboard Pages
- Production Dependencies
- Ecom-DZ & Build Docs
- TypeScript Config
- Dev Dependencies
- Admin CRUD API
- Admin Products & Messages API
- Info Pages & i18n
- Public Products & Shipping API
- Storefront Nav & Layout
- Orders & Contact Submission API
- Brand Logo Design
- Admin Orders & API Client
- Storefront i18n System
- Bundle Offer Components
- Product Catalog Listing
- Database Seed Script
- Product Grid & Category
- Root Layout & Fonts
- Favicon Brand Mark
- Wilayas & Communes Data
- Meta CAPI Server Route
- Admin Order Detail API
- Admin Pages CMS API
- Bulk Admin Seed Script
- Admin Bundle Detail API
- EcoTrack Expedition API
- Admin Shipping API
- Categories API
- Public Pages API
- Product Slug API
- Socials API
- Wilayas API
- Order Summary Component
- Admin Seed Script
- Product Photo
- Config Diagnostics API
- Logo Component
- Checkout Form Component
- Stock Badge Component
- Auth Middleware
- pnpm Workspace Config
- DB Connection Test
- Next.js Config
- Next.js Types

## God Nodes (most connected - your core abstractions)
1. `connectToDatabase()` - 66 edges
2. `useI18n()` - 35 edges
3. `trackCustomEvent()` - 17 edges
4. `compilerOptions` - 17 edges
5. `authOptions` - 16 edges
6. `ProductPage()` - 13 edges
7. `trackPurchase()` - 10 edges
8. `generateEventId()` - 10 edges
9. `CheckoutPage()` - 9 edges
10. `buildMetaUserData()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Ecom-DZ Delivery API Documentation` --semantically_similar_to--> `Meta Pixel Documentation and Credentials`  [INFERRED] [semantically similar]
  ecom-delivery-docs.md → metapixeldocsandcredetentials.md
- `.env.local Environments File` --semantically_similar_to--> `Ecom-DZ API Key`  [INFERRED] [semantically similar]
  build-output.txt → ecom-delivery-docs.md
- `Ecom-DZ Delivery API Documentation` --semantically_similar_to--> `GitHub Copilot/AI Agent Instructions`  [INFERRED] [semantically similar]
  ecom-delivery-docs.md → .github/copilot-instructions.md
- `Conversions Attribution via Facebook` --semantically_similar_to--> `Ecom-DZ Delivery API Documentation`  [INFERRED] [semantically similar]
  metapixeldocsandcredetentials.md → ecom-delivery-docs.md
- `PUT()` --calls--> `connectToDatabase()`  [EXTRACTED]
  app/api/admin/bundles/[bundleId]/route.ts → utils/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ecom-DZ Authenticated Parcel (Colis) Management Flow** — ecom_delivery_docs_key, ecom_delivery_docs_token, ecom_delivery_docs_header_auth, ecom_delivery_docs_base_url, ecom_delivery_docs_endpoint_colis, ecom_delivery_docs_tarification, ecom_delivery_docs_quota_ratelimit [EXTRACTED 0.95]
- **Meta Pixel Tracking and Conversion Stack** — metapixeldocsandcredetentials_meta_pixel, metapixeldocsandcredetentials_pixel_id, metapixeldocsandcredetentials_standard_events, metapixeldocsandcredetentials_advanced_matching, metapixeldocsandcredetentials_facebook_conversions_api [EXTRACTED 0.95]
- **Third-Party Integration Config Files** — ecom_delivery_docs, metapixeldocsandcredetentials, pnpm_workspace, build_output [INFERRED 0.75]

## Communities (56 total, 9 thin omitted)

### Community 0 - "Checkout & Meta Tracking"
Cohesion: 0.08
Nodes (41): CartItem, CheckoutPage(), handleSubmit(), validateStock(), Wilaya, ContactPage(), handleSubmit(), SocialLink (+33 more)

### Community 1 - "Admin Dashboard Pages"
Cohesion: 0.05
Nodes (33): Message, deliveryStatusColors, ExpeditedOrder, orderStatusColors, situationColors, dynamic, metadata, DashboardHome() (+25 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.05
Nodes (37): axios, bcryptjs, chart.js, mongodb, mongoose, next-auth, dependencies, axios (+29 more)

### Community 3 - "Ecom-DZ & Build Docs"
Cohesion: 0.08
Nodes (32): Next.js Build Log, Next.js cpus Build Experiment, .env.local Environments File, Next Build Out-of-Memory Failure, Next.js 14.2.33 Build Environment, Ecom-DZ Delivery API Documentation, Ecom-DZ Colis Avancements and Situations, Ecom-DZ API Base URL (+24 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+19 more)

### Community 5 - "Dev Dependencies"
Cohesion: 0.07
Nodes (27): autoprefixer, cross-env, dotenv, eslint, eslint-config-next, devDependencies, autoprefixer, cross-env (+19 more)

### Community 6 - "Admin CRUD API"
Cohesion: 0.13
Nodes (13): dynamic, GET(), dynamic, ecomdzFetch(), POST(), dynamic, GET(), POST() (+5 more)

### Community 7 - "Admin Products & Messages API"
Cohesion: 0.16
Nodes (15): DELETE(), dynamic, GET(), PUT(), dynamic, GET(), POST(), DELETE() (+7 more)

### Community 8 - "Info Pages & i18n"
Cohesion: 0.16
Nodes (10): defaultFaqsAr, defaultFaqsFr, FAQItem, FAQPage(), ThankYouContent(), ReturnsPage(), ShippingPage(), TermsPage() (+2 more)

### Community 9 - "Public Products & Shipping API"
Cohesion: 0.12
Nodes (10): dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic, GET() (+2 more)

### Community 10 - "Storefront Nav & Layout"
Cohesion: 0.24
Nodes (7): HomePage(), Category, CategoryStrip(), Footer(), SocialLink, trackCustomEvent(), Navbar()

### Community 11 - "Orders & Contact Submission API"
Cohesion: 0.29
Nodes (9): dynamic, GET(), POST(), revalidate, dynamic, POST(), checkRateLimit(), rateLimitStore (+1 more)

### Community 12 - "Brand Logo Design"
Cohesion: 0.31
Nodes (11): Algerian E-commerce Market Context, Black Square Background Field, Brand Mark / Emblem Concept, Minimal Geometric Design Intent, Embedded Raster Bitmap (1024x1024 PNG), Gold Accent Color (Hex #C9A84C), ZAK SHOP Logo (SVG), Monochrome Palette (Black & White) (+3 more)

### Community 13 - "Admin Orders & API Client"
Cohesion: 0.24
Nodes (6): allStatuses, Order, statusColors, adminAPI, FetchOptions, publicAPI

### Community 14 - "Storefront i18n System"
Cohesion: 0.29
Nodes (6): I18nContext, I18nContextType, I18nProvider(), I18nProviderProps, Locale, translations

### Community 15 - "Bundle Offer Components"
Cohesion: 0.25
Nodes (7): Bundle, BundleOfferCard(), BundleOfferCardProps, BundleVariant, BundleVariant, BundleVariantSelector(), BundleVariantSelectorProps

### Community 16 - "Product Catalog Listing"
Cohesion: 0.29
Nodes (4): Category, Product, ProductsContent(), trackSearch()

### Community 17 - "Database Seed Script"
Cohesion: 0.29
Nodes (7): args, convertIds(), dbNameArg, fs, { MongoClient, ObjectId }, path, seed()

### Community 18 - "Product Grid & Category"
Cohesion: 0.33
Nodes (4): CategoryPage(), Product, ProductGrid(), ProductGridProps

### Community 19 - "Root Layout & Fonts"
Cohesion: 0.29
Nodes (5): cormorant, metadata, montserrat, viewport, ConditionalLayout()

### Community 20 - "Favicon Brand Mark"
Cohesion: 0.48
Nodes (7): Dark Background (#0A0A0A), ZAK SHOP Favicon SVG, Gold Left Accent Bar, Gold Thin Underline, Luxury Color Palette (Black, Gold, White), White Z Lettermark, ZAK SHOP Brand Identity

### Community 21 - "Wilayas & Communes Data"
Cohesion: 0.47
Nodes (4): dynamic, GET(), communes, getCommunes()

### Community 22 - "Meta CAPI Server Route"
Cohesion: 0.53
Nodes (5): dynamic, isSha256(), normalizePhone(), POST(), sha256()

### Community 23 - "Admin Order Detail API"
Cohesion: 0.40
Nodes (3): dynamic, GET(), PUT()

### Community 24 - "Admin Pages CMS API"
Cohesion: 0.40
Nodes (4): dynamic, GET(), PUT(), VALID_PAGES

### Community 25 - "Bulk Admin Seed Script"
Cohesion: 0.40
Nodes (3): ADMINS, bcrypt, { MongoClient }

### Community 26 - "Admin Bundle Detail API"
Cohesion: 0.50
Nodes (3): DELETE(), dynamic, PUT()

### Community 27 - "EcoTrack Expedition API"
Cohesion: 0.67
Nodes (3): dynamic, ecomdzRequest(), POST()

### Community 28 - "Admin Shipping API"
Cohesion: 0.50
Nodes (3): dynamic, GET(), PUT()

### Community 29 - "Categories API"
Cohesion: 0.50
Nodes (3): dynamic, GET(), revalidate

### Community 30 - "Public Pages API"
Cohesion: 0.50
Nodes (3): dynamic, GET(), VALID_PAGES

### Community 31 - "Product Slug API"
Cohesion: 0.50
Nodes (3): dynamic, GET(), revalidate

### Community 32 - "Socials API"
Cohesion: 0.50
Nodes (3): dynamic, GET(), revalidate

### Community 33 - "Wilayas API"
Cohesion: 0.50
Nodes (3): dynamic, GET(), revalidate

### Community 34 - "Order Summary Component"
Cohesion: 0.50
Nodes (3): CartItem, ShopifyOrderSummary(), ShopifyOrderSummaryProps

### Community 36 - "Product Photo"
Cohesion: 0.67
Nodes (4): WhatsApp Image 2026-08-30 at 12.36.02, E-commerce Catalog Content, Product Photo (Likely Clothing Item), ZAK SHOP Brand

### Community 42 - "pnpm Workspace Config"
Cohesion: 1.00
Nodes (3): pnpm Workspace Config, sharp allowBuilds Directive, unrs-resolver allowBuilds Directive

## Ambiguous Edges - Review These
- `WhatsApp Image 2026-08-30 at 12.36.02` → `Product Photo (Likely Clothing Item)`  [AMBIGUOUS]
  WhatsApp Image 2026-08-30 at 12.36.02.jpeg · relation: references

## Knowledge Gaps
- **181 isolated node(s):** `dynamic`, `dynamic`, `dynamic`, `dynamic`, `dynamic` (+176 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `WhatsApp Image 2026-08-30 at 12.36.02` and `Product Photo (Likely Clothing Item)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `connectToDatabase()` connect `Admin Products & Messages API` to `Socials API`, `Wilayas API`, `Admin CRUD API`, `Public Products & Shipping API`, `Orders & Contact Submission API`, `Product Grid & Category`, `Admin Order Detail API`, `Admin Pages CMS API`, `Admin Bundle Detail API`, `EcoTrack Expedition API`, `Admin Shipping API`, `Categories API`, `Public Pages API`, `Product Slug API`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `useI18n()` connect `Info Pages & i18n` to `Checkout & Meta Tracking`, `Order Summary Component`, `Checkout Form Component`, `Storefront Nav & Layout`, `Storefront i18n System`, `Bundle Offer Components`, `Product Catalog Listing`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `ProductGrid()` connect `Product Grid & Category` to `Storefront Nav & Layout`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `dynamic`, `dynamic`, `dynamic` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Checkout & Meta Tracking` be split into smaller, more focused modules?**
  _Cohesion score 0.07769423558897243 - nodes in this community are weakly interconnected._
- **Should `Admin Dashboard Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05241090146750524 - nodes in this community are weakly interconnected._