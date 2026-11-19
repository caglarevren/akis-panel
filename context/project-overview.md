# Akış: Proje Genel Bakış

Ajans hesap yöneticileri için **Müşteri ve İçerik Takip Paneli** (MVP).

---

## Amaç

Ajansın hesap yöneticileri; müşterileri, bu müşterilere ait içerikleri ve içeriklerin hangi aşamada olduğunu tek bir yerden takip etmek istiyor. Panel bir iç araçtır; müşteriler panele giriş yapmaz.

## MVP Kapsamı

- Müşteri ekleme ve listeleme
- Müşteriye bağlı içerik (sosyal medya gönderisi, blog yazısı, web sayfası vb.) ekleme ve düzenleme
- İçerik durumunun (taslak, onayda, yayında) güncellenmesi ve duruma göre filtreleme
- Genel durumu özetleyen bir ana ekran

Tasarım ve kullanıcı deneyimi projenin öncelikli konusudur.

## Netleşmiş Kararlar

| Konu | Karar |
|---|---|
| Yetki | Tek rol. Her hesap yöneticisi tüm müşterileri görür. Müşterinin "sorumlu yöneticisi" sadece bilgi ve filtre içindir, erişimi kısıtlamaz. |
| Hesaplar | Kayıt ekranı yok. Hesaplar `npm run db:create-user` ile oluşturulur. |
| Onay süreci | "Onayda" ajans içi onaydır. Durum geçişleri serbesttir (her durumdan her duruma). Arayüz doğal akışı ana aksiyonla öne çıkarır: Taslak → "Onaya gönder", Onayda → "Yayınla". Geri adımlar ikincil menüdedir. "Yayında"ya geçişte `publishedAt` otomatik dolar, her geçiş aktivite kaydına yazılır. |
| İçerik alanları | Başlık, müşteri, tür, platform, yayın tarihi (isteğe bağlı), sorumlu, not/metin. **Dosya yükleme yok.** |
| Dil | next-intl: `tr` (varsayılan), `en`, `ru`, `de`. Sadece arayüz metinleri çevrilir; kullanıcının girdiği veri (müşteri adı, içerik başlığı) çevrilmez. Almanca metinler daha uzun olduğu için düzen buna göre test edilir. |
| Tema | Açık ve koyu tema baştan birlikte. |
| Deploy | Ücretsiz: Vercel Hobby + Neon Free. Vercel Hobby ticari olmayan kullanım içindir; panel ajans içinde günlük kullanılacaksa Cloudflare Workers Free (OpenNext) veya Vercel Pro'ya geçilmesi gerekir. Karar Faz 8'de verilecek. |

## Tasarım

Referans: `context/prototype/akis-prototip.html` (tıklanabilir HTML prototip, örnek verilerle). Kullanıcı onaylı, sadeleştirilmiş ikinci versiyon.

- Linear/Vercel çizgisinde sakin bir dil. Hafif soğuk nötr tonlar, tek vurgu rengi (indigo: açıkta `#4b45d6`, koyuda `#8e8bff`).
- Durum renkleri her yerde aynı: Taslak gri, Onayda amber, Yayında yeşil (`--status-*` token'ları, `app/globals.css`).
- Tipografi: Geist Sans; tarih ve sayılarda Geist Mono / tabular rakamlar.
- Ağır gölge yerine ince kenarlık. Kısa (150-250 ms) ve amaçlı animasyonlar, `prefers-reduced-motion` desteği.
- Bilgi yoğunluğu bilinçli olarak düşük tutuldu: özet kartlarında sadece sayı, içerik satırları tek satır (platform rozeti, başlık, müşteri, tarih, durum).

### Ekranlar

| Ekran | İçerik |
|---|---|
| Ana ekran | 4 özet kartı (aktif müşteri, toplam içerik, onay bekleyen, 7 gün içinde yayın), altında ince durum dağılımı çubuğu, gecikme varsa kırmızı uyarı şeridi, "Önümüzdeki 7 gün" (güne göre gruplu liste), onay bekleyenler (doğrudan "Yayınla"), son 5 hareket. Kartlar ve dağılım etiketleri ilgili filtreyle içerik listesine gider. |
| Müşteriler | Arama, Tümü/Aktif/Pasif filtresi, kart grid'i (durum çubuğu, toplam içerik, sorumlu, sıradaki yayın). "Yeni müşteri" dialog'u. |
| Müşteri detayı | İletişim bilgileri, sayılı durum sekmeleri, müşterinin içerikleri, müşteri önceden seçili "Yeni içerik". |
| İçerikler | Metin araması, sayılı durum sekmeleri, tür ve müşteri filtresi; filtreler URL'de tutulur. Satırdaki durum etiketinden durum değişikliği (optimistic + geri al). |
| İçerik paneli | Sağdan açılan sheet. Düzenlemede üstte durum + ana aksiyon. Yeni içerikte "Taslak olarak kaydet" / "Kaydet ve onaya gönder". |

## Teknoloji Yığını

| Kategori | Seçim |
|---|---|
| Framework | Next.js 16.4.5 (App Router, Turbopack). 16.4.4 ve öncesinde kritik güvenlik açıkları olduğu için 16.4.5'e sabitlendi. |
| Kütüphane | React 19 |
| Dil | TypeScript (strict) |
| CSS/UI | Tailwind CSS v4 (CSS-first) + shadcn/ui (style: base-nova, base color: neutral, Base UI) |
| i18n | next-intl (tr/en/ru/de, her zaman prefix'li) |
| Veritabanı | Prisma 7 + Neon Postgres |
| Auth | NextAuth v5 (Auth.js): Credentials provider, bcrypt, JWT session (30 gün) |
| Bildirim | sonner (toast) |
| Tema | next-themes (`class` stratejisi) |
| Test | Vitest |

## Veri Modeli

Kaynak: `prisma/schema.prisma`.

```
User      id, name, email (unique), password, createdAt, updatedAt
Client    id, name (unique), sector?, contactName?, contactEmail?, contactPhone?,
          brandColor (#RRGGBB), isActive, ownerId → User, createdAt, updatedAt
Content   id, title, type (SOCIAL_POST | BLOG_POST | WEB_PAGE | OTHER),
          platform (INSTAGRAM | LINKEDIN | X | TIKTOK | FACEBOOK | BLOG | MEDIUM | WEBSITE | NEWSLETTER),
          notes?, status (DRAFT | IN_REVIEW | PUBLISHED), publishDate? (@db.Date), publishedAt?,
          clientId → Client, assigneeId → User, createdAt, updatedAt
Activity  id, kind (CLIENT_CREATED | CONTENT_CREATED | STATUS_CHANGED), userId → User,
          clientId → Client, contentId? → Content, fromStatus?, toStatus?, createdAt
```

- Tür → platform eşlemesi `lib/content-options.ts`'te (`PLATFORMS_BY_TYPE`). Form doğrulaması ve varsayılan platform buradan okunur.
- Müşteri silinirse içerikleri ve aktiviteleri de silinir (cascade). Bir kullanıcı, müşterisi, içeriği veya aktivitesi varken silinemez (restrict).
- Seed (`npm run db:seed`, `prisma/seed-data.ts`): 3 hesap yöneticisi, 4 müşteri (1 pasif), 12 içerik, türetilmiş aktivite geçmişi. Tarihler seed'in çalıştığı güne göre göreli. Yeni oluşturulan seed kullanıcılarının kullanılabilir şifresi yoktur; `db:create-user` ile şifre verilir.

## Yol Haritası

| Faz | İş | Durum |
|---|---|---|
| 0. Kurulum | Next.js, Tailwind v4, shadcn, next-intl (4 dil), Prisma + Neon, NextAuth, Vitest, context dosyaları | Tamamlandı |
| 1. Tasarım | Token'lar ve tıklanabilir prototip | Tamamlandı (`context/prototype/`) |
| 2. Veri | Şema, migration, gerçekçi seed | Tamamlandı |
| 3. Uygulama iskeleti | Sidebar, üst bar, dil değiştirici, tema, giriş | Tamamlandı |
| 4. Müşteriler | Liste, arama, ekleme, detay | Tamamlandı |
| 5. İçerikler | Ekleme/düzenleme panelleri, doğrulama, testler | Tamamlandı |
| 6. Durum ve filtreler | Ana aksiyon + menü, optimistic güncelleme, URL tabanlı filtreler, aktivite kaydı | Tamamlandı |
| 7. Ana ekran | Özet kartları, 7 gün listesi, onay bekleyenler, son hareketler | Tamamlandı |
| 8. Cila ve yayın | Boş/yüklenme/hata halleri, 4 dilde kontrol, erişilebilirlik, deploy | Deploy yapıldı (Vercel Hobby); cila turu bekliyor |

MVP sonrasına bırakılanlar: kanban görünümü, ⌘K komut paleti, dosya ekleri, giriş denemesi sınırı (Upstash rate limit).
