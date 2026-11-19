# Kilit Grup

Ajans hesap yöneticileri için müşteri ve içerik takip paneli.

## Kurulum

```bash
npm install                 # postinstall, Prisma client'ı da üretir
cp .env.example .env        # DATABASE_URL, DIRECT_URL ve AUTH_SECRET değerlerini doldur
npx prisma migrate dev      # şemayı veritabanına uygular
npm run db:seed             # örnek veri + demo hesabı (pelin.kilit / 123456)
npm run dev
```

Panel `http://localhost:3000` adresinde açılır ve giriş ekranına yönlendirir. Diller: `/tr` (varsayılan), `/en`, `/ru`, `/de`.

Tasarım referansı: `context/prototype/akis-prototip.html` (tarayıcıda açılabilen tıklanabilir prototip).
