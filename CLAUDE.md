# Akış

Bir ajansın hesap yöneticilerinin kullandığı müşteri ve içerik takip paneli (MVP). Hesap yöneticileri müşteri ekler, müşterilere bağlı içerikleri (sosyal medya gönderisi, blog yazısı, web sayfası vb.) oluşturur ve düzenler, içeriklerin durumunu (taslak, onayda, yayında) takip eder. "Akış" geçici ürün adıdır.

@AGENTS.md

## Context Files

Projenin tüm içeriğini anlamak için lütfen aşağıdakileri oku:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev            # dev server (Turbopack), http://localhost:3000
npm run build          # production build
npm run start          # production build'i çalıştırır
npm run lint           # ESLint (flat config, eslint-config-next)
npm run test           # unit testler (Vitest): sadece server action'lar ve utility'ler
npm run test:watch     # unit testler, watch modu
npm run db:create-user -- --email=... --password=... --name="..."   # hesap yöneticisi oluşturur/şifresini günceller
npm run db:seed        # örnek veriyi yeniden yükler (sadece development): müşteri/içerik/aktivite silinip baştan oluşturulur
```

## Demo hesabı

Proje bir iş başvurusu için hazırlanıyor; değerlendiriciler tek bir paylaşılan hesapla giriş yapıyor: **`pelin.kilit` / `123456`** (Pelin Kilit). Hesap `npm run db:seed` ile oluşturulur ve şifresi her seed'de bu değere sıfırlanır. Bilgilerin tek kaynağı `lib/demo-account.ts`; hem seed hem giriş ekranındaki "Demo hesabı" notu (tek tıkla doldurma butonuyla) buradan okur. Gerçek kullanıma geçilirse notu kaldırmak için giriş sayfasında `LoginForm`'a `demo` prop'unu vermemek yeterli. Giriş kullanıcı adı veya e-postayla yapılabiliyor. Diğer seed kullanıcılarının (Mert Demir, Elif Şahin) kullanılabilir şifresi yok; sadece sorumlu kişi olarak görünüyorlar. Müşteriler kilitgroup.com/faaliyet-alanlari sayfasındaki markalar; iletişim kişileri, e-postalar ve telefonlar uydurmadır.

## Notlar

- **npm 10.9.2 hatası:** Bu makinedeki npm sürümü, Vitest'in bağımlılık ağacını çözerken `Cannot read properties of null (reading 'edgesOut')` hatası veriyor (boş bir projede bile). Vitest ile ilgili paket kurulum/güncellemeleri için `npx npm@11.6.2 install ...` kullan.
## Neon MCP

- Project: `akis-panel` (project id `frosty-leaf-35311796`, region `aws-eu-central-1`).
- Default branch for all Neon MCP reads/writes: `development` (branch id `br-raspy-credit-bhb0itfs`). Always pass this `branchId` explicitly on `run_sql` / `get_database_tables` / etc. — the project's default branch is `production`.
- Never run anything against the `production` branch (branch id `br-fragrant-dust-bhl0bsm0`) — reads or writes — unless the user explicitly names "production" in the request. If a task seems like it needs production, ask first.
- Local `.env` points at `development`. Prisma 7 is pinned on purpose; ignore the CLI's "major update available" banner.
- `prisma migrate dev` refuses to run in this non-interactive environment. To add a migration: create `prisma/migrations/<timestamp>_<name>/migration.sql` from `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, then `npx prisma migrate deploy`.
