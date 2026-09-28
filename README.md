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

- **İçerik:** Yönetim panelini kullanın veya `src/data/profile.js`, `projects.json`, `posts.json` dosyalarını düzenleyin.
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

Mevcut koleksiyona yeni fotoğraflar eklemek için `--append` kullanın; mevcut
fotoğraflar ve favori kimlikleri korunur, aynı içerik tekrar eklenmez.

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

## Yerel içerik paneli (Studio)

`studio.bat` dosyasını açın veya terminalde `npm run studio` çalıştırın. Panel:
[http://127.0.0.1:5174/__studio](http://127.0.0.1:5174/__studio).
Normal `npm run dev` sunucusundan bağımsızdır; üretim derlemesine dahil edilmez.

- **Fotoğraflar:** Çoklu yükleme, albüm, kapak/sıralama, etiket, tarih, açıklama,
  alternatif metin, haritadan konum ve toplu metadata düzenleme.
- **Pipeline:** Orijinal JPEG/PNG/WebP yükleyip mevcut Gallery Privacy işleminden
  geçirin. Orijinal ve sonucu karşılaştırın; kişi/yüz/plaka kutularını çizin,
  taşıyın, boyutlandırın veya kaldırın. Person etiketlerini açıp kapatın.
  Yeniden işlemden sonra fotoğrafı tekrar inceleyip onaylayın.
- **Projeler ve blog:** Kalıcı sayfa adresi, kapak, etiket, Markdown editörü,
  metin içi görseller ve önizleme. Yazı tarihi otomatik yayın zamanlaması değildir.
- **Yayın merkezi:** Mobil/masaüstü gerçek site önizlemesi, değişiklik özeti,
  yerel siteye aktarım, sürüm geçmişi ve ayrı GitHub gönderimi.

Taslak kaydetmek siteyi değiştirmez. “Yayına dahil” seçilen ve fotoğraflar için
ayrıca incelendi olarak işaretlenen içerikler “Site dosyalarına aktar” ile
`src/data/{photos,projects,posts}.json` dosyalarına yazılır. Yalnızca kullanılan
işlenmiş görseller `public/studio/` içine kopyalanır. Derleme başarısız olursa
önceki içerik listeleri geri yüklenir. Başarılı derlemeden sonra ayrı “GitHub’a
gönder” düğmesi içerik dosyalarını commit edip mevcut dalı `origin`e gönderir.
Panel dışında kod değişiklikleri varsa önce bunları normal Git akışında commit
etmek gerekir. Bu düğme force-push yapmaz; canlı dağıtım GitHub bağlantınıza bağlıdır.

Taslaklar, orijinaller, tespit raporları ve yayın öncesi yedekler `.studio/`
klasöründe tutulur; Git'e ve üretim sitesine dahil edilmez. Bu klasörü ayrıca
yedekleyin. Geçmişteki sürüm önce taslağa yüklenir, kendiliğinden yayımlanmaz.
EXIF/GPS taşınmaz; haritadan seçilen konum ancak “Konumu sitede göster” açıkken
yayın verisine eklenir. Harita açıldığında OpenStreetMap döşemeleri yüklenir.

Mevcut galeri ve “Hazır işlenmiş fotoğraf” yüklemeleri tekrar tespit işlemine
sokulmaz. Bu fotoğraflarda orijinal pipeline kaydı olmadığı için gömülü kutu,
mozaik ve Person etiketleri geri alınamaz. Bunları düzenlemek için orijinali
“Pipeline ile işle” yöntemiyle yükleyin. Kapak ve yazı görselleri yalnızca web
formatına dönüştürülür; otomatik yüz/plaka maskelemesi uygulanmaz.

Varsayılan Python ortamı, komşu `../yazilim/berkealp_galari/.venv` ortamıdır.
Farklı konum kullanırken paneli başlatmadan önce PowerShell'de ayarlayın:

```powershell
$env:STUDIO_PIPELINE_HOME = 'C:\Yol\berkealp_galari'
$env:STUDIO_PYTHON = 'C:\Yol\berkealp_galari\.venv\Scripts\python.exe'
$env:STUDIO_PORT = '5174'
npm run studio
```

Pipeline paketinin, Pillow'un ve `models/` dosyalarının bu ortamda hazır olması
gerekir. Panel yalnızca `127.0.0.1` üzerinde çalışır. Bekleyen işlem kuyruğu
bellektedir; paneli kapatmadan önce işlemleri tamamlayın. İçerik ve yayın akışı
testleri: `npm run test:studio`.

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
