# Go / No-Go Görevi (fNIRS senkronizasyonlu)

İnhibisyon kontrolü ve dikkat süreçlerini hem davranışsal hem de
nörofizyolojik (fNIRS) düzeyde değerlendirmek için geliştirilmiş, tarayıcı
tabanlı bir Go/No-Go görevi. Miao ve ark. (2017), Monden ve ark. (2012, 2015)
çalışmaları temel alınmıştır.

> **Geliştiren Araştırmacı:** **Doç. Dr. Mert Doğan**

**Teknoloji:** Saf HTML/CSS/JavaScript — kurulum gerektirmez. **Mac ve
Windows'ta** herhangi bir modern tarayıcıda (Chrome/Edge önerilir) aynı şekilde
çalışır.

---

## Kurulum (yalnızca ilk sefer)

Uygulamanın tek gereksinimi **Python 3**'tür (uygulamanın kendisi saf HTML/JS,
ek paket gerektirmez). Python kurulu değilse otomatik kuran betikler:

- **Mac:** `setup-mac.command`'a çift tıklayın → Homebrew varsa `brew install
  python`, yoksa Apple Command Line Tools (Python 3 içerir) kurulumunu başlatır.
- **Windows:** `setup-windows.bat`'a çift tıklayın → `winget` ile Python 3'ü
  kurar; `winget` yoksa resmi indirme sayfasını açar.

Python zaten kuruluysa betikler bunu algılar ve hiçbir şey kurmaz. Başlatıcılar
(`start-*`) da Python'u bulamazsa kurulumu otomatik çağırır.

---

## Çalıştırma

### En kolay yol — çift tıkla (önerilir)
Yerel sunucuyu başlatır ve tarayıcıyı otomatik açar:

- **Mac:** `start-mac.command` dosyasına çift tıklayın.
  - İlk açılışta macOS güvenlik uyarısı çıkarsa: dosyaya **sağ tık → Aç → Aç**.
- **Windows:** `start-windows.bat` dosyasına çift tıklayın.

Açılan terminal penceresi sunucuyu çalışır tutar; görev bitince pencereyi
kapatın veya **Ctrl+C** ile durdurun. (Gereksinim: bilgisayarda Python 3 kurulu
olması. Yoksa <https://www.python.org/downloads/> — Windows'ta kurulumda
*"Add Python to PATH"* işaretleyin.)

### Alternatif — elle yerel sunucu
```bash
cd GoNGo
python3 serve.py                 # Windows'ta: py serve.py
```
`serve.py` boş bir port bulur (varsayılan 8123), dosyaları sunar ve tarayıcıda
`http://localhost:<port>/index.html` adresini açar.

### En basit (tek dosya, sunucusuz)
`index.html` dosyasına doğrudan çift tıklayabilirsiniz; görev `file://` ile de
çalışır. Yalnızca **Web Serial TTL tetikleyici** özelliği `http://localhost`
gerektirir — fNIRS tetik kutusu kullanacaksanız yukarıdaki başlatıcıları
tercih edin.

---

## Görev yapısı

| Parametre | Değer |
|---|---|
| Blok seti | 6 (her set: 1 Go bloğu + 1 Go/No-Go bloğu) |
| Blok başına uyaran | 24 |
| Uyaran süresi | 300 ms |
| Uyaranlar arası süre (ISI) | 700 ms (SOA = 1000 ms) |
| Yönerge ekranı | her blok öncesi 3 sn |
| Setler arası dinlenme | 10 sn (son setten sonra yok) |
| Blok seti süresi | 54 sn · **Toplam ≈ 374 sn** (5 × 10 sn dinlenme dâhil) |
| Uyaranlar | Çizgi film hayvanları (gömülü SVG, çevrimdışı) |
| Yanıt | Sağ el işaret parmağı — **BOŞLUK** tuşu veya ekrana dokunma |

- **Go bloğu (temel):** **kedi** ve **köpek** — her ikisi de "go", her uyaranda
  hızlıca basın.
- **Go/No-Go bloğu (hedef):** hedef **tavuk** → bas; standart **ördek** →
  **basma** (inhibisyon). (Monden/Miao paradigması ve Liddle ve ark. 2001 ile
  uyumlu; setler arası 10 sn dinlenme fNIRS hemodinamik toparlanması içindir.)
- Veri toplamadan önce geri bildirimli kısa bir **alıştırma** oturumu çalışır.

### Görev sırasında kontrol
Görev/yönerge ekranlarının sağ üstünde iki buton bulunur:
- **⏸ Duraklat / ▶ Devam Et** — görevi denemeler arasında güvenle duraklatır ve
  kaldığı yerden sürdürür (zamanlama kayması otomatik düzeltilir, kaydedilen
  uyaran başlangıç zamanları doğru kalır).
- **⏹ Bitir** — görevi erken sonlandırır (onay sorulur); o ana kadar toplanan
  veriler korunur ve özet/dışa aktarma ekranı açılır. `ESC` tuşu da aynı işi
  yapar (onaysız).

---

## fNIRS senkronizasyonu

Görev, olayları (uyaran başlangıcı, yanıt, blok/dinlenme) fNIRS kaydına
işaretlemek için **üç bağımsız yol** sunar. Bunlardan **birini** seçmeniz yeterli;
güvenlik için ikisini birden (ör. TTL + günlük) kullanabilirsiniz.

### Hangi yöntemi seçmeli?

| Yöntem | Donanım | Gecikme/Doğruluk | Ne zaman |
|---|---|---|---|
| **A. Fotodiyot (optik)** | Işık sensörü (fotodiyot) + AUX kablosu | En düşük gecikme, donanımsal | Her sistemde çalışır; en evrensel |
| **B. Seri/TTL tetikleyici** | USB-seri veya Arduino tetik kutusu | Düşük gecikme, kodlu olaylar | Sisteminizin dijital/paralel tetik girişi varsa |
| **C. Çevrimdışı hizalama** | Yok | Sonradan hizalama | Donanım tetiği yoksa; yedek olarak |

> Monden/Miao çalışmalarında kullanılan Hitachi ETG sistemleri dâhil çoğu fNIRS
> cihazı (NIRx, Artinis, Shimadzu, Hitachi) bir **dijital tetik (TTL/paralel)**
> veya **AUX analog** girişi kabul eder. Yöntem A bu AUX girişini, yöntem B ise
> dijital tetik girişini kullanır.

---

### Yöntem A — Fotodiyot (optik senkron) ✅ önerilen, en evrensel

Görevde ekranın **sağ-alt köşesinde** her uyaran başlangıcında beyaza dönen bir
**senkron karesi** vardır (`config.js → fnirs.photodiodeSync`, varsayılan açık).

1. Bir **fotodiyot/ışık sensörü** modülünü (ör. TTL çıkışlı bir ışık sensörü)
   ekranın sağ-alt köşesine, senkron karesinin üzerine sabitleyin (siyah bantla
   ışık sızıntısını önleyin).
2. Sensörün çıkışını fNIRS cihazının **AUX / trigger / event** girişine bağlayın.
3. Karenin siyah→beyaz geçişi = uyaran başlangıcı. fNIRS kaydında bu yükselen
   kenarları olay başlangıcı (onset) olarak kullanın.
4. **Hangi uyaran** olduğunu (Go/Target/Standard) ayırt etmek için bu optik
   işaretleri, indirilen **`events.tsv`** dosyasındaki sırayla eşleştirin (ikisi
   de aynı sırada ve aynı `onset` aralığındadır).

Avantaj: yazılım/sürücü gerektirmez, ekranın gerçek yenileme anına kilitlidir
(en düşük jitter).

---

### Yöntem B — Seri / TTL tetikleyici (kodlu olaylar)

Her olayda tarayıcı, **Web Serial** üzerinden tek byte'lık bir **kod** gönderir;
bir aracı kutu bunu fNIRS cihazının dijital tetik girişine iletir.

**Gereksinimler:**
- Tarayıcı: **Chrome veya Edge** (Web Serial yalnızca bunlarda var).
- Sayfa **`http://localhost`** veya `https://` üzerinden açılmalı (bu yüzden
  `start-*` / `serve.py` kullanın; `file://` ile Web Serial **çalışmaz**).
- Bir **USB-seri köprü**: en pratiği bir **Arduino** (örnek kod aşağıda).

**Bağlantı adımları:**
1. `serve.py` ile görevi `localhost`'tan açın.
2. Kurulum ekranında **“Seri TTL tetikleyici (fNIRS)”** kutusunu işaretleyin
   (veya `config.js → fnirs.serialTriggers: true`).
3. “Görevi Başlat”a basınca tarayıcı **seri port seçme** penceresi açar →
   Arduino/USB-seri cihazınızı seçin (baud 115200).
4. Arduino, gelen kodu fNIRS’in **paralel (8-bit) veya dijital** tetik girişine
   yansıtır. Kodlar olay tipini ayırt eder (tabloya bakın).

**Örnek Arduino tetik kutusu:** `arduino_trigger/trigger.ino` (bu repoda).
Gelen byte'ı 8 dijital pine (D2–D9) yansıtır ve kısa bir darbe üretir; bu pinleri
fNIRS cihazının paralel/dijital tetik girişine bağlayın. Tek hatlı (yalnızca
“olay var” darbesi) bir giriş için pini D2'ye bağlamanız yeterlidir.

---

### Yöntem C — Çevrimdışı zaman damgası hizalaması (yedek)

Donanım tetiği yoksa: indirilen **`..._markers.csv`** her olayı yüksek
çözünürlüklü (`t_perf_ms`) **ve** Unix zaman damgasıyla (`t_unix_ms`) verir;
**`..._events.tsv`** ise ilk uyarana göre saniye cinsinden
`onset / duration / trial_type` verir. fNIRS kaydının başlangıç saatini not edip
(ör. her ikisini de aynı bilgisayarın saatiyle), olayları bu zaman damgalarına
göre çevrimdışı hizalayabilirsiniz. (Donanım tetiğine göre daha az kesin —
yalnızca yedek olarak önerilir.)

---

### Tetik kodları

`config.js → fnirs.triggerCodes` altında düzenlenebilir:

| Olay | Kod | Açıklama |
|---|---|---|
| `goOnset` | 1 | Go bloğu uyaran başlangıcı |
| `targetOnset` | 2 | Go/No-Go **hedef** (tavuk → bas) başlangıcı |
| `standardOnset` | 3 | Go/No-Go **standart** (ördek → basma) başlangıcı |
| `response` | 8 | Katılımcı yanıtı (tuş/dokunma) |
| `blockStart` | 10 | Blok başlangıcı |
| `rest` | 15 | Setler arası dinlenme başlangıcı |
| `blockEnd` | 20 | Blok sonu |

GLM analizi için ilgili koşullar: **`GoNoGo_target`** (go) ve
**`GoNoGo_standard`** (no-go) — `events.tsv` içindeki `trial_type` sütunu bunları
hazır verir.

### Bağlantıyı doğrulama (kayıt öncesi)
1. Kısa bir test koşumu yapın (alıştırma yeterli).
2. Yöntem A: fNIRS AUX kanalında, uyaran başına bir darbe görmelisiniz.
3. Yöntem B: Arduino seri monitöründe gelen kodları izleyin; sonra fNIRS tetik
   kanalında karşılık gelen olayları doğrulayın.
4. Olay **sayısının** beklenenle eştiğini kontrol edin: tam görevde blok başına
   24 uyaran × 12 blok = **288 uyaran tetiği** + blok/dinlenme işaretleri.

---

## Çıktı / Sonuç ölçümleri (Outcome measures)

Görev sonunda **Verileri Kaydet** ile **4 okunabilir tablo** iner (hepsi Excel /
SPSS / R ile doğrudan açılır):

- **`..._summary.csv`** ⭐ — **asıl sonuç tablosu**. Her satır bir faz × blok
  tipi: doğruluk %, ortalama/SS tepki süresi, omisyon, komisyon, d′. Analize
  hazır.
- **`..._trials.csv`** — deneme bazlı: katılımcı, blok seti, blok tipi, deneme,
  hayvan, uyaran tipi, beklenen yanıt, verilen yanıt, **tepki süresi (ms)**,
  sonuç (`hit`/`miss`/`cr`/`fa`), uyaran başlangıç zamanı (yüksek çözünürlüklü +
  Unix).
- **`..._events.tsv`** — BIDS benzeri (`onset`, `duration`, `trial_type`,
  `response_time`) — fNIRS GLM analizi için doğrudan kullanılabilir.
- **`..._markers.csv`** — olay işaretleyicileri düz tablo (`code`, `label`,
  `t_perf_ms`, `t_unix_ms`) — fNIRS zaman hizalaması için.

> Tam arşiv **`..._session.json`** (meta + ham işaretler + tüm denemeler)
> varsayılan olarak **inmez**; gerekiyorsa `config.js → export.includeJSON: true`
> ile açın.

**Hesaplanan özet ölçümler (blok tipine göre):**
- Doğruluk oranı
- Ortalama ve std. sapma **tepki süresi**
- **Omisyon hataları** (Go'ya yanıt vermeme)
- **Komisyon hataları** (No-Go'ya basma = inhibisyon hatası)
- **d′** (sinyal saptama duyarlılığı)

---

## Yapılandırma

Tüm parametreler **`js/config.js`** içinden ayarlanır:

- Blok/deneme sayıları ve zamanlama (ms)
- `goNoGoTargetRatio` — Go/No-Go bloğundaki hedef (Go) oranı (0.5 dengeli;
  inhibisyonu güçlendirmek için 0.67–0.75). **Başlangıç formundan istediğiniz
  yüzdeyi (%10–%90) serbestçe girebilirsiniz**; form değeri config'i geçersiz
  kılar ve seçilen orana göre Go/No-Go deneme sayıları anlık olarak gösterilir.
- `restDuration` — setler arası dinlenme süresi (ms; 0 = dinlenme yok)
- `animals.goBlock.a` / `animals.goBlock.b` — Go bloğu uyaranları (varsayılan
  `cat` / `dog`; ikisi de "bas")
- `animals.target` / `animals.standard` — Go/No-Go hedef/standart uyaranları
  (varsayılan `chicken` / `duck`). Seçenekler: `cat`, `dog`, `lion`, `elephant`,
  `frog`, `chicken`, `duck`; yenisi `js/svgStimuli.js`'e eklenir.
- `responseKeys` — kabul edilen yanıt tuşları
- `practice` — alıştırma açık/kapalı, deneme sayıları, geri bildirim
- `fnirs` — fotodiyot, seri tetikleyici, tetik kodları (dinlenme kodu = 15)

---

## Dosya yapısı
```
GoNGo/
├── index.html              # giriş noktası
├── css/style.css           # arayüz
├── js/
│   ├── config.js           # tüm parametreler
│   ├── svgStimuli.js       # gömülü hayvan SVG'leri
│   ├── triggers.js         # fNIRS senkron (fotodiyot + TTL + günlük)
│   ├── data.js             # kayıt, özet, dışa aktarma
│   └── task.js             # deney motoru (zamanlama, akış)
├── arduino_trigger/
│   └── trigger.ino         # örnek Arduino TTL tetik kutusu (Yöntem B)
├── serve.py, start-*, setup-*   # yerel sunucu ve kurulum betikleri
└── README.md
```

## Notlar
- En kararlı zamanlama için görevi **tam ekran**, **ön planda** ve başka ağır
  işlem yokken çalıştırın (motor başlatırken tam ekran ister).
- Zamanlama `performance.now()` + `requestAnimationFrame` ile sürüklenme
  düzeltmeli olarak yürütülür; gerçek uyaran başlangıç zamanları kaydedilir.
