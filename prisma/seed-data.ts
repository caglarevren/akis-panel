import type { ContentStatus, ContentType, Platform } from "../generated/prisma/enums";

// Small, realistic sample data for the development branch. Dates are offsets
// in days from the day the seed runs, so "next 7 days" and "overdue" stay
// meaningful whenever it's re-run.

export interface SeedUser {
  key: string;
  name: string;
  email: string;
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
  { key: "ayse", name: "Ayşe Kaya", email: "ayse@akis.dev" },
  { key: "mert", name: "Mert Demir", email: "mert@akis.dev" },
  { key: "elif", name: "Elif Şahin", email: "elif@akis.dev" },
];

export const SEED_CLIENTS: SeedClient[] = [
  {
    key: "lumen",
    name: "Lumen Kahve",
    sector: "Yiyecek & İçecek",
    contactName: "Zeynep Arslan",
    contactEmail: "zeynep@lumenkahve.com",
    contactPhone: "+90 532 410 22 18",
    brandColor: "#C2410C",
    isActive: true,
    owner: "ayse",
    createdDaysAgo: 120,
  },
  {
    key: "atlas",
    name: "Atlas Lojistik",
    sector: "Lojistik",
    contactName: "Burak Öztürk",
    contactEmail: "burak.ozturk@atlaslojistik.com.tr",
    contactPhone: "+90 216 555 40 10",
    brandColor: "#1D4ED8",
    isActive: true,
    owner: "mert",
    createdDaysAgo: 95,
  },
  {
    key: "nova",
    name: "Nova Diş Kliniği",
    sector: "Sağlık",
    contactName: "Dr. Selin Aydın",
    contactEmail: "selin@novadis.com",
    contactPhone: "+90 242 333 12 90",
    brandColor: "#0F766E",
    isActive: true,
    owner: "ayse",
    createdDaysAgo: 60,
  },
  {
    key: "maviyali",
    name: "Mavi Yalı Otel",
    sector: "Turizm",
    contactName: "Hakan Koç",
    contactEmail: "hakan@maviyali.com",
    contactPhone: "+90 252 614 70 70",
    brandColor: "#0E7490",
    isActive: false,
    owner: "elif",
    createdDaysAgo: 200,
  },
];

export const SEED_CONTENTS: SeedContent[] = [
  {
    client: "lumen",
    title: "Kış menüsü lansman karuseli",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "IN_REVIEW",
    publishInDays: 1,
    assignee: "ayse",
    createdDaysAgo: 6,
    notes: "5 kare karusel. Son karede şube haritası. Müşteri fiyatları cuma günü teyit edecek.",
  },
  {
    client: "lumen",
    title: "Barista ile 60 saniye (reels)",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "DRAFT",
    publishInDays: 4,
    assignee: "ayse",
    createdDaysAgo: 3,
    notes: "Çekim Kadıköy şubesinde.",
  },
  {
    client: "lumen",
    title: "Evde filtre kahve demleme rehberi",
    type: "BLOG_POST",
    platform: "BLOG",
    status: "PUBLISHED",
    publishInDays: -6,
    assignee: "ayse",
    createdDaysAgo: 18,
  },
  {
    client: "atlas",
    title: "Yeni Gebze aktarma merkezi duyurusu",
    type: "SOCIAL_POST",
    platform: "LINKEDIN",
    status: "IN_REVIEW",
    publishInDays: 2,
    assignee: "mert",
    createdDaysAgo: 5,
    notes: "Basın bülteniyle aynı gün çıkmalı.",
  },
  {
    client: "atlas",
    title: "Hizmetler sayfası yenileme",
    type: "WEB_PAGE",
    platform: "WEBSITE",
    status: "IN_REVIEW",
    publishInDays: -1,
    assignee: "mert",
    createdDaysAgo: 21,
    notes: "Müşteri ikinci revizyonu bekliyor.",
  },
  {
    client: "atlas",
    title: "Soğuk zincir lojistiğinde yeni dönem",
    type: "BLOG_POST",
    platform: "BLOG",
    status: "DRAFT",
    publishInDays: 9,
    assignee: "mert",
    createdDaysAgo: 2,
  },
  {
    client: "atlas",
    title: "Müşteri bülteni",
    type: "OTHER",
    platform: "NEWSLETTER",
    status: "PUBLISHED",
    publishInDays: -4,
    assignee: "mert",
    createdDaysAgo: 12,
  },
  {
    client: "nova",
    title: "Diş beyazlatma hakkında 5 yanlış bilgi",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "PUBLISHED",
    publishInDays: -3,
    assignee: "ayse",
    createdDaysAgo: 10,
  },
  {
    client: "nova",
    title: "İmplant tedavisi kaç seans sürer?",
    type: "BLOG_POST",
    platform: "BLOG",
    status: "IN_REVIEW",
    publishInDays: 3,
    assignee: "ayse",
    createdDaysAgo: 8,
    notes: "Hekim onayı gerekli.",
  },
  {
    client: "nova",
    title: "Online randevu sayfası",
    type: "WEB_PAGE",
    platform: "WEBSITE",
    status: "DRAFT",
    publishInDays: null,
    assignee: "elif",
    createdDaysAgo: 1,
  },
  {
    client: "maviyali",
    title: "Oda ve süitler sayfası",
    type: "WEB_PAGE",
    platform: "WEBSITE",
    status: "PUBLISHED",
    publishInDays: -40,
    assignee: "elif",
    createdDaysAgo: 70,
  },
  {
    client: "maviyali",
    title: "Yaz sezonu kapanış gönderisi",
    type: "SOCIAL_POST",
    platform: "INSTAGRAM",
    status: "PUBLISHED",
    publishInDays: -55,
    assignee: "elif",
    createdDaysAgo: 62,
  },
];
