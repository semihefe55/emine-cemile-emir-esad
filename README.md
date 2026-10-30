# Emine Cemile & Emir Es’ad — Dijital Düğün Davetiyesi

Tek sayfalık, bağımlılığı olmayan (saf HTML/CSS/JS) dijital davetiye.
Mobil öncelikli; WhatsApp içinden açıldığında da sorunsuz çalışır.

## Dosyalar

| Dosya | Açıklama |
|---|---|
| `index.html` | Tüm içerik ve motif kütüphanesi (SVG) |
| `styles.css` | Görsel sistem: renkler, tipografi, animasyonlar |
| `script.js` | Açılış, geri sayım, takvim, müzik, katılım formu |
| `og.html` | WhatsApp önizleme kapağının kaynağı (1200×630) |
| `assets/og-cover.png` | Üretilmiş önizleme kapağı |
| `assets/motif-*.png` | Davetiye görselinden kırpılmış kenar motifleri (köşeler ve yan şerit) |
| `assets/favicon.svg` | Sekme simgesi |

## İletişim numaraları

`script.js` içindeki `CONFIG.contacts` listesine telefonları yazın; numarası boş olan kişi sayfada gösterilmez.

## Yayına almadan önce yapılacak 3 ayar

`script.js` dosyasının en üstündeki `CONFIG` bloğu:

```js
siteUrl:       'https://emine-cemile-emir-esad.vercel.app/',  // yayın adresiniz
rsvpWhatsapp:  '',   // katılımların geleceği numara, örn. '905321234567'
rsvpEndpoint:  '',   // isteğe bağlı: Formspree vb. POST adresi
```

1. **`siteUrl`** — yayın adresiniz. Aynı adresi `index.html` içindeki
   `og:url`, `twitter:image`, `canonical` ve `og:image` etiketlerinde de güncelleyin.
2. **`rsvpWhatsapp`** — boş bırakılırsa katılım mesajı WhatsApp'ta kişi seçme
   ekranını açar; numara yazarsanız doğrudan size gelir.
3. **`rsvpEndpoint`** — doldurursanız form ayrıca oraya JSON gönderir.
   Boş kalırsa bilgiler tarayıcıda saklanır ve WhatsApp ile iletilir.

### Müzik

Arka plan müziği `assets/music.m4a` dosyasıdır (AAC, ~1,6 MB).
Değiştirmek için yeni dosyayı aynı ada koyun ya da `index.html` içindeki
`<audio ... data-src="...">` değerini güncelleyin. Büyük bir mp3'ü küçültmek için:

```bash
afconvert -f m4af -d aac -b 96000 -s 3 girdi.mp3 assets/music.m4a
```

Dosya bulunamazsa site sessizce devreye giren çok sade bir ezgi üretir; yani düğme
her hâlükârda çalışır. Tarayıcı kuralları gereği müzik kendiliğinden başlamaz —
kullanıcı açılışa dokunduğunda ya da müzik düğmesine bastığında başlar.
Parça başında ve sonunda yumuşak geçiş uygulanır, böylece döngü dikişi duyulmaz.

## Yayınlama

### Vercel (önerilen — `emine-cemile-emir-esad.vercel.app`)

```bash
npx vercel --prod
```

Proje adı sorulduğunda `emine-cemile-emir-esad` yazın.
Node kurulu değilse: [vercel.com/new](https://vercel.com/new) → **Import** yerine
klasörü sürükleyip bırakın ya da GitHub'a yükleyip içe aktarın.
Proje adı adresi belirler: `emine-cemile-emir-esad.vercel.app`.

### Netlify

```bash
npx netlify deploy --prod --dir .
```

Ya da [app.netlify.com/drop](https://app.netlify.com/drop) adresine klasörü sürükleyin.
Site adını **Site settings → Change site name** altından
`emine-cemile-emir-esad` yapın.

### Özel alan adı (`eminecemile-emiresad.com`)

Alan adını bir kayıt firmasından aldıktan sonra:
**Vercel → Project → Settings → Domains → Add** ve gösterilen
A / CNAME kayıtlarını alan adı panelinize girin. Sertifika otomatik gelir.
Alan adı bağlandıktan sonra `CONFIG.siteUrl` ve meta etiketlerini güncelleyip
yeniden yayınlayın.

## Önizleme kapağını yeniden üretme

`og.html` üzerinde değişiklik yaparsanız:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --window-size=1200,630 --virtual-time-budget=6000 \
  --screenshot="$PWD/assets/og-cover.png" "file://$PWD/og.html"
```

## Yerelde çalıştırma

```bash
python3 -m http.server 4180
```

Sonra tarayıcıda `http://localhost:4180` adresini açın.

## Notlar

- Açılış animasyonu oturum başına bir kez gösterilir; kapanıştaki
  **“Açılışı tekrar izle”** ile yeniden başlatılabilir.
- Cihazda “hareketi azalt” açıksa animasyonlar sadeleşir.
- Tüm metinler gerçek HTML'dir; görsele gömülü yazı yoktur.
