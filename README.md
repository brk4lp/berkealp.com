# berkealp.com

Kişisel portfolyo & web sitesi. Tek kod tabanı, iki "kabuk":

- **Masaüstü (≥768px):** Windows XP masaüstü — sürüklenebilir pencereler, taskbar, Start menüsü, saat.
- **Mobil (<768px):** iOS 6 esintili modern ana ekran — glossy ikonlar, cam dock, safe-area ve tam ekran uygulama görünümü.

İçerik (Hakkımda, Projeler, Blog, İletişim) bir kez yazılır; her iki kabuk aynı içeriği kendi
arayüzünde gösterir.

## Kurulum

Önce [Node.js](https://nodejs.org) (18+ önerilir) kurulu olmalı. Sonra:

```bash
npm install      # bağımlılıkları yükle
npm run dev      # geliştirme sunucusu (http://localhost:5173)
npm run build    # üretim derlemesi (dist/)
npm run preview  # derlemeyi önizle
```

## Yapı

```
src/
  App.jsx              # viewport'a göre kabuk seçer
  hooks/               # useMediaQuery, useWindowManager
  data/                # profile, projects, posts, apps (tek kayıt), icons
  apps/                # About, Projects, Blog, Contact (kabuktan bağımsız içerik)
  shells/xp/           # Windows XP kabuğu
  shells/ios/          # Klasik iOS esintili modern mobil kabuk
  styles/              # reset, fonts, content
```

## Özelleştirme

- **İçerik:** `src/data/profile.js`, `projects.js`, `posts.js` dosyalarındaki placeholder'ları düzenle.
- **Yeni bölüm:** `src/data/apps.js`'e tek satır ekle — hem XP hem iOS otomatik günceller.
- **CV:** Gerçek dosyanı `public/cv-placeholder.pdf` olarak ekle (veya `profile.js`'te `cvUrl`'i değiştir).

## Not

Windows XP ve iOS görselleri telif nedeniyle kopyalanmadı; tüm arayüz CSS + SVG ile yeniden
üretildi (telifsiz ve hafif).

## İkon atıfları

iOS uygulama ikonlarında kullanılan ve kendi dosya başlıklarında atıf şartı belirten SVG
varlıkları [SVGStack](https://svgstack.com/) kaynaklıdır.
