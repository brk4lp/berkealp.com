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

## Photos

`/photos` hem XP masaüstünden hem iOS ana ekranından açılır. Masaüstünde Windows
Picture and Fax Viewer düzeni kullanılır: beyaz görüntü alanı, klasik araç çubuğu,
ileri/geri, pencereye sığdırma, gerçek boyut, yakınlaştırma, döndürme, küçük resimler
ve slayt gösterisi. Sol/sağ oklar fotoğrafı değiştirir; +/- yakınlaştırır; F5 slayt
gösterisini başlatır/durdurur; Escape durdurup pencereye sığdırır. Döndürme yalnızca
görüntülemeyi etkiler. Pencere odağı kaybolunca slayt gösterisi durur.

Mobilde iPhone Photos düzeninde Library / Albums / Search, ızgara boyutu, yıl/ay grupları, tam ekran
görüntüleyici, küçük resim şeridi, yakınlaştırma ve fotoğraf bilgileri içerir.
Sağ/sol oklar veya yatay kaydırma fotoğrafı değiştirir; Escape galeriyi geri açar.
Favoriler ziyaretçinin kendi tarayıcısında saklanır; ortak koleksiyonu değiştirmez.

Fotoğraf listesi `src/data/photos.json`, web kopyaları `public/photos/` içindedir.
`title`, `alt`, `album` ve isteğe bağlı `date` (`YYYY-MM-DD`), `location`, `caption`
alanları düzenlenebilir. Tarihi olmayanlar yıl/ay görünümünde “Undated” altında
gösterilir. WhatsApp dosya adındaki tarih çekim tarihi olarak kullanılmaz.

İşlenmiş PNG klasöründen web kopyalarını hazırlamak için (Python + Pillow):

```powershell
python scripts/import-photos.py "C:\IslenmisFotograflar"
```

Bu komut koleksiyon listesini seçilen klasörle değiştirir; aynı içerik kimliğine
sahip fotoğrafların elle yazılan bilgilerini korur. 2400 px WebP görüntüler ve
560 px küçük resimler üretir. Kaynak dosyalara dokunmaz; EXIF/GPS ve özel JSON
tespit raporlarını siteye kopyalamaz. Fotoğraf düzenleme ve yüz/plaka tespiti
ayrı yerel araçta yapılır; bu uygulama hazır fotoğrafları gösterir.

Etiketli web kopyaları için aynı komuta `--person-labels` ekleyin ve Gallery
Privacy aracının kurulu olduğu Python ortamını kullanın. PNG dosyalarının
yanındaki doğrulanmış JSON raporlarından mevcut kişi kutuları okunur; yalnızca
“Person 1, Person 2…” etiketleri eklenir. Tespit ve mozaik işlemi tekrarlanmaz.
Fotoğraf kimlikleri ve favoriler korunur; yeni içerik adresleri tarayıcı
önbelleğinin eski görselleri göstermesini önler.

## Görseller

Windows XP ve iOS kabukları CSS ile oluşturulur. Uygulama ikonları aşağıdaki
kaynaklardan alınır; mobil ve masaüstü ikonları ayrı tanımlanır.

## İkon atıfları

Apple uygulama ikonları [aroundsketch/Apple-App-Icons](https://github.com/aroundsketch/Apple-App-Icons)
deposundan alınır. Kaynak sürümü ve eşleştirmeler [icons/apple/ATTRIBUTION.md](icons/apple/ATTRIBUTION.md)
dosyasındadır. Ortak ikon kaydı `src/data/appleIcons.js` içindedir.

Spotify ve GitHub ikonları [SVGStack](https://svgstack.com/) kaynaklıdır;
dosya başlıklarındaki atıflar korunur. Windows ikonlarının kaynakları
[public/icons/xp/ATTRIBUTION.md](public/icons/xp/ATTRIBUTION.md) dosyasındadır.
