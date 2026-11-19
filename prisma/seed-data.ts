import type { ContentStatus, ContentType, Platform } from "../generated/prisma/enums";
import { DEMO_ACCOUNT } from "../lib/demo-account";

// Small, realistic sample data for the development branch. Dates are offsets
// in days from the day the seed runs, so "next 7 days" and "overdue" stay
// meaningful whenever it's re-run.

export interface SeedUser {
  key: string;
  name: string;
  email: string;
  username?: string;
  // Only for the shared demo account reviewers sign in with. Other seed
  // users get an unusable random password.
  demoPassword?: string;
}

export interface SeedClient {
  key: string;
  name: string;
  sector: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  brandColor: string;
  isActive: boolean;
  owner: string;
  createdDaysAgo: number;
}

export interface SeedContent {
  client: string;
  title: string;
  type: ContentType;
  platform: Platform;
  status: ContentStatus;
  publishInDays: number | null;
  assignee: string;
  createdDaysAgo: number;
  notes?: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    key: "pelin",
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    username: DEMO_ACCOUNT.username,
    demoPassword: DEMO_ACCOUNT.password,
  },
  { key: "mert", name: "Mert Demir", email: "mert@akis.dev" },
  { key: "elif", name: "Elif Şahin", email: "elif@akis.dev" },
];

// Brands from Kilit Grup's business areas (kilitgroup.com/faaliyet-alanlari).
// Contact people, emails and phone numbers are made up for the demo.
export const SEED_CLIENTS: SeedClient[] = [
  {
    key: "crystal",
    name: "Crystal Hotels",
    sector: "Turizm ve Otelcilik",
    contactName: "Zeynep Arslan",
    contactEmail: "zeynep.arslan@example.com",
    contactPhone: "+90 242 000 00 01",
    brandColor: "#0E7490",
    isActive: true,
    owner: "pelin",
    createdDaysAgo: 120,
  },
  {
    key: "nirvana",
    name: "Nirvana Hotels",
    sector: "Turizm ve Otelcilik",
    contactName: "Burak Öztürk",
    contactEmail: "burak.ozturk@example.com",
    contactPhone: "+90 242 000 00 02",
    brandColor: "#0F766E",
    isActive: true,
    owner: "mert",
    createdDaysAgo: 95,
  },
  {
    key: "galeri",
    name: "Galeri Kristal",
    sector: "HORECA & Toptan Satış",
    contactName: "Selin Aydın",
    contactEmail: "selin.aydin@example.com",
    contactPhone: "+90 242 000 00 03",
    brandColor: "#C2410C",
    isActive: true,
    owner: "pelin",
    createdDaysAgo: 80,
  },
  {
    key: "endustriyel",
    name: "Kristal Endüstriyel",
    sector: "Endüstriyel Mutfak Ekipmanları",
    contactName: "Hakan Koç",
    contactEmail: "hakan.koc@example.com",
    contactPhone: "+90 242 000 00 04",
    brandColor: "#1D4ED8",
    isActive: true,
    owner: "elif",
    createdDaysAgo: 60,
  },
  {
    key: "cosmos",
    name: "Cosmos Theatre",
    sector: "MICE & Eğlence",
    contactName: "Deniz Kılıç",
    contactEmail: "deniz.kilic@example.com",
    contactPhone: "+90 242 000 00 05",
    brandColor: "#BE185D",
    isActive: false,
    owner: "mert",
    createdDaysAgo: 200,
  },
];

export const SEED_CONTENTS: SeedContent[] = [
  {
    client: "crystal",
    title: "Crystal Waterworld erken rezervasyon kampanyası",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "IN_REVIEW",
    publishInDays: 1,
    assignee: "pelin",
    createdDaysAgo: 6,
    notes: "5 kareli karusel. İndirim oranı satış ekibinden teyit edilecek.",
  },
  {
    client: "crystal",
    title: "Crystal Kaymaklı: Kapadokya'da balon sezonu rehberi",
    type: "BLOG_POST",
    platform: "BLOG",
    status: "DRAFT",
    publishInDays: 4,
    assignee: "pelin",
    createdDaysAgo: 3,
  },
  {
    client: "crystal",
    title: "Yılbaşı programı duyurusu",
    type: "SOCIAL_POST",
    platform: "FACEBOOK",
    status: "PUBLISHED",
    publishInDays: -3,
    assignee: "pelin",
    createdDaysAgo: 12,
  },
  {
    client: "nirvana",
    title: "Nirvana Dolce Vita oda ve süitler sayfası",
    type: "WEB_PAGE",
    platform: "WEBSITE",
    status: "IN_REVIEW",
    publishInDays: -1,
    assignee: "mert",
    createdDaysAgo: 21,
    notes: "Oda galerisi görselleri bekleniyor.",
  },
  {
    client: "nirvana",
    title: "Cosmo Fit yeni yıl üyelik kampanyası",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "IN_REVIEW",
    publishInDays: 2,
    assignee: "mert",
    createdDaysAgo: 5,
  },
  {
    client: "nirvana",
    title: "ME SPA kış ritüelleri tanıtım videosu",
    type: "SOCIAL_POST",
    platform: "TIKTOK",
    status: "DRAFT",
    publishInDays: null,
    assignee: "elif",
    createdDaysAgo: 1,
  },
  {
    client: "nirvana",
    title: "Chayote şef menüsü e-bülteni",
    type: "OTHER",
    platform: "NEWSLETTER",
    status: "PUBLISHED",
    publishInDays: -6,
    assignee: "mert",
    createdDaysAgo: 14,
  },
  {
    client: "galeri",
    title: "Otel ve restoranlar için porselen seçme rehberi",
    type: "BLOG_POST",
    platform: "BLOG",
    status: "IN_REVIEW",
    publishInDays: 3,
    assignee: "pelin",
    createdDaysAgo: 8,
    notes: "Tulû Porselen ürün görselleriyle desteklenecek.",
  },
  {
    client: "galeri",
    title: "Yeni mağaza açılışı duyurusu",
    type: "SOCIAL_POST",
    platform: "LINKEDIN",
    status: "DRAFT",
    publishInDays: 9,
    assignee: "pelin",
    createdDaysAgo: 2,
  },
  {
    client: "galeri",
    title: "HORECA ürün kataloğu sayfası",
    type: "WEB_PAGE",
    platform: "WEBSITE",
    status: "PUBLISHED",
    publishInDays: -12,
    assignee: "elif",
    createdDaysAgo: 30,
  },
  {
    client: "endustriyel",
    title: "Gelato dondurma makineleri lansmanı",
    type: "SOCIAL_POST",
    platform: "LINKEDIN",
    status: "DRAFT",
    publishInDays: 5,
    assignee: "elif",
    createdDaysAgo: 4,
  },
  {
    client: "endustriyel",
    title: "85 ülkeye ihracat: fuar katılımı duyurusu",
    type: "SOCIAL_POST",
    platform: "LINKEDIN",
    status: "PUBLISHED",
    publishInDays: -9,
    assignee: "elif",
    createdDaysAgo: 18,
  },
  {
    client: "cosmos",
    title: "Sezon açılış gösterisi duyurusu",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "PUBLISHED",
    publishInDays: -40,
    assignee: "mert",
    createdDaysAgo: 70,
  },
  {
    client: "cosmos",
    title: "Sahne teknolojileri sayfası",
    type: "WEB_PAGE",
    platform: "WEBSITE",
    status: "PUBLISHED",
    publishInDays: -55,
    assignee: "mert",
    createdDaysAgo: 62,
  },
];
