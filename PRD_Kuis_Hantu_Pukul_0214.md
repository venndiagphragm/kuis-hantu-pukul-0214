# PRD: Kuis Hantu Pukul 02.14

## Tujuan dan batas produk

Game escape room edukasi untuk presentasi kelas Manajemen Jaringan. Pemain membantu Ucok keluar dari lantai 7 Gedung Nano dengan memecahkan enam pesan; setiap pesan mengajarkan cara kerja cipher, bukan sekadar meminta tebakan ruangan. Target satu permainan cerita 8–12 menit, tanpa batas waktu yang mematikan permainan. Pengunjung juga bisa mempelajari metode secara terpisah atau memainkan satu ronde Guess Message untuk dua kelompok pada layar yang sama.

**Sumber dan status keputusan:** alur Ucok, Bu Probabilita, lima sobekan absen, urutan enam tahap, tiga nyawa, biaya hint, dan akhir cerita berasal dari [Rancangan Storyline, Plan 2](Rancangan_Storyline_Cryptography.docx), bagian 3. Cakupan pelajaran berasal dari [TM12 - Criptography](TM12%20-%20Criptography.pdf), slide 7–26. Pilihan multi-page, pixel-art, akses Guess dari landing, soal tetap, dan penyimpanan progres browser adalah keputusan produk untuk PRD ini. Koreksi pesan Pantry dijelaskan di bawah. Bu Probabilita adalah tokoh fiktif dan tidak mewakili dosen nyata.

**Risiko kesesuaian tugas:** slide 27 materi menyebut “Buat 1 halaman website”, sedangkan rancangan ini memilih empat halaman sesuai permintaan pengguna. Karena itu, kesesuaian dengan rubrik tugas belum pasti; konfirmasikan ke pengampu sebelum implementasi atau penyerahan. PRD ini tidak diam-diam mengubah pilihan multi-page menjadi satu halaman.

PRD ini menjadi acuan implementasi website. Implementasi berupa situs statis tanpa server, API, akun, aset eksternal yang wajib dimuat, atau koneksi internet. Empat URL berkas saling terhubung dengan tautan relatif agar dapat dibuka secara offline: `index.html` (landing), `metode.html` (pelajaran), `game.html` (cerita), dan `guess.html` (demo). Tidak ada leaderboard online, matchmaking, soal cerita acak, atau ruangan pengecoh wajib. Cipher klasik dan contoh visual dalam situs ini tidak boleh dipromosikan sebagai cara mengamankan pesan nyata.

## Alur halaman

| Halaman | Kebutuhan yang terlihat dan dapat dilakukan |
| --- | --- |
| `index.html` | Menampilkan jam 02.14, premis Ucok terjebak, dan tiga aksi berlabel: **Mulai Cerita** (atau **Lanjutkan Cerita** bila ada progres), **Pelajari Metode**, **Guess Message**. Akses Guess langsung tersedia; twist Bu Probabilita dan jawaban demo tidak muncul di landing. |
| `metode.html` | Daftar materi dengan contoh yang bisa diubah sendiri. Setiap metode memiliki input, kunci atau parameter bila relevan, aksi jalankan/balikkan bila bermakna, dan hasil beserta langkah yang menjelaskan perubahan. Pengunjung dapat kembali ke landing atau cerita tanpa mengubah progres. |
| `game.html` | Menampilkan satu ruangan aktif, objek yang bisa dibuka, denah, input jawaban, nyawa, skor, waktu berlalu, hint bertingkat, dan Lab cipher tahap itu. Jawaban benar membuka tujuan berikutnya. Setelah tahap boss, lembar absen perlu ditandatangani untuk membuka lift dan penutup. |
| `guess.html` | Host menjalankan satu ronde tetap 60 detik dan memilih kelompok A/B sebelum memasukkan tebakan lisan. Jawaban benar menunjukkan pemenang; waktu habis mengungkap pesan. Tombol **Ulangi Ronde** memulai soal yang sama dari awal dan tidak menyentuh progres cerita. |

Tautan kembali ke halaman lain harus memiliki tujuan nyata; berpindah halaman saat cerita berlangsung tidak mereset tahap. Saat `game.html` dibuka tanpa progres, tampil tahap 1. Tidak ada pertukaran data antarpemain atau kebutuhan login.

## Materi dan simulasi di `metode.html`

Semua metode pada slide 8–26 memiliki aktivitas mandiri. Enkripsi mengubah plaintext menjadi ciphertext dengan kunci; dekripsi membaliknya. Encoding mengubah representasi data tanpa menyediakan kerahasiaan, sedangkan hash menghasilkan ringkasan satu arah yang diverifikasi dengan menghitung ulang, bukan didekripsi. Steganografi menyembunyikan keberadaan pesan dalam wadah; itu berbeda dari enkripsi. Jelaskan perbedaan tersebut sebelum aktivitas.

| Topik | Interaksi dan batas kejujuran |
| --- | --- |
| Caesar (slide 8–13) | Pengunjung mengubah teks dan besar geser pada roda alfabet, melihat perubahan tiap huruf, lalu membalik geser untuk dekripsi. Contoh `KE` dengan geser 4 menjadi `OI`. |
| Scytale (slide 14) | Pengunjung memilih jumlah kolom/lilitan, mengisi teks, melihat huruf ditata per baris dan dibaca per kolom, lalu membalik susunannya; parameter dan aturan padding ditampilkan. Contoh `ABCDE` dengan 3 kolom tanpa padding dibaca `ADBEC`. |
| Vigenère (slide 15–16) | Pengunjung mengisi teks dan kunci, melihat kunci diulang di bawah huruf serta pergeseran per posisi; hasil enkripsi/dekripsi benar-benar dihitung. Contoh `ABC` dengan kunci `B` menjadi `BCD`. |
| Pigpen (slide 17–18) | Pengunjung memilih huruf atau simbol untuk menyandi/membaca; legenda dan bentuk simbol tersedia berdampingan. Ikuti tepat kunci pada slide: grid A–I tanpa titik, J–R bertitik, kisi X S–V tanpa titik, W–Z bertitik. Bentuk digambar sebagai SVG, bukan font Pigpen yang mungkin memakai pemetaan lain. |
| Steganografi (slide 19) | Pengunjung mengubah teks wadah berupa beberapa kata dan mencoba mengekstrak huruf pertama tiap kata; contoh `Kopi Enak` mengungkap `KE`. Tunjukkan teks wadah dan pesan tersembunyi berdampingan setelah aksi ekstraksi. Ini contoh teknik akrostik, bukan klaim menyembunyikan data secara aman. |
| Rail Fence (slide 20–22) | Pengunjung mengatur jumlah rail, menyusun huruf zigzag, membaca barisnya untuk enkripsi, serta mengisi kembali zigzag untuk dekripsi; tampilkan jalur huruf dan hasil yang dihitung. |
| Playfair (tambahan dari Plan 2) | Pengunjung memasukkan kunci dan pasangan huruf, melihat kisi 5×5, penggabungan I/J, aturan baris/kolom/persegi panjang dan padding, lalu hasil hitungan dua arah. Kisi `MEDIAN` harus cocok dengan lampiran sumber. |
| Hill 2×2 (tambahan dari Plan 2) | Pengunjung memasukkan pasangan huruf dan matriks kunci yang dapat diinvers modulo 26, lalu melihat konversi A=0–Z=25, perkalian, sisa mod 26, dan hasil dua arah. Contoh cerita memakai matriks `[[3,3],[2,5]]`, invers `[[15,17],[20,9]]`, dan padding X. |
| bcrypt, MD5 (`hashlib`), Argon2 (slide 23–26) | Masing-masing memiliki ilustrasi alur input, salt bila relevan, dan verifikasi kecocokan setelah pengunjung mengubah masukan. Beri label tepat **“Simulasi konsep, bukan hasil hash asli”**; tampilkan status cocok/tidak cocok atau langkah, tanpa string/digit hash rekaan. Jangan menyebut hasil ilustrasi sebagai keluaran bcrypt, MD5, atau Argon2. MD5 diberi label **tidak aman untuk password**; bcrypt dan Argon2 dijelaskan sebagai metode hash password dengan salt. Tidak diperlukan library hash khusus atau backend. |
| Simetris, asimetris, Enigma (slide 7 dan sejarah materi) | Pengunjung menggerakkan kunci bersama dari pengirim ke penerima pada diagram simetris, memasangkan kunci publik/pribadi pada diagram asimetris, dan mengubah posisi rotor pada diagram alur Enigma untuk melihat urutan substitusi konseptual. Label jelas bahwa diagram ini menjelaskan mekanisme, **bukan implementasi enkripsi sungguhan**. |

Untuk cipher yang sama dengan cerita, simulator menghitung hasil riil dari input, bukan memilih jawaban dari daftar. Contoh tetap tersedia sebagai titik mulai tetapi tidak membatasi teks yang bisa dicoba. Penjelasan dan kontrol juga harus bekerja tanpa warna sebagai satu-satunya penanda.

## Cerita dan data enam tahap

Ucok tertidur di 7.11A saat belajar Probabilitas, terbangun pukul 02.14, dan menemukan lembar absen robek menjadi lima bagian. Papan tulis ditandatangani Bu Probabilita. Denah memperlihatkan pintu yang sudah dikenal tetapi hanya mengizinkan tujuan tahap berikutnya setelah jawaban benar. Pada tabel berikut, ciphertext dipisahkan spasi hanya untuk keterbacaan; simulator dan pemeriksa jawaban memakai huruf tanpa spasi. Sebutan “potongan diperoleh” berarti potongan masuk ke progres saat tahap itu selesai meski petunjuknya mungkin sudah terlihat saat objek diperiksa.

| Tahap / ruang | Objek wajib dibuka dan soal/kunci | Ciphertext | Jawaban pemain | Pintu yang terbuka / potongan absen | Hint 1, 2, 3 berurutan |
| --- | --- | --- | --- | --- | --- |
| 1 / 7.11A | Papan tulis: “Dua koin dilempar bersamaan. Berapa banyak titik sampelnya?” Jawaban 4 (`AA, AG, GA, GG`); klik potongan di meja bertuliskan “Geser sebanyak jawaban Soal 1.” Caesar, geser 4. | `OI TERXVC HYPY` | `KE PANTRY DULU` | Pantry / potongan pertama di meja | 1. Kunci Caesar adalah jawaban soal koin.<br>2. Sebutkan semua hasil lemparan dua koin.<br>3. Geser mundur 4 huruf. |
| 2 / Pantry | Klik pintu kulkas dan potongan kedua: “Sebuah dadu dilempar. Berapa banyak titik sampelnya?” Rail Fence, 6 rail dari jawaban soal. | `LGAEI ABCMT DGABE INAKR ARU` | `LEMBAR KETIGA DI RUANG BACA` | Ruang Baca / potongan kedua di kulkas | 1. Hurufnya tidak berganti, hanya berpindah tempat.<br>2. Jumlah rail sama dengan jawaban soal dadu.<br>3. Gunakan 6 rail. |
| 3 / Ruang Baca | Klik buku statistika dan potongan ketiga di antaranya. “Nilai yang paling sering muncul dalam data disebut ____ (5 huruf).” Vigenère, kunci `MODUS`. | `OSUGA ZHRCD QHEYJ NWVCC` | `CERMIN TOILET BERBISIK` | Toilet / potongan ketiga di buku | 1. Kuncinya sebuah istilah statistika.<br>2. Ukuran pemusatan data yang paling sering muncul.<br>3. Huruf pertama kunci adalah M. |
| 4 / Toilet | Klik cermin berembun: “Nilai tengah dari data yang sudah diurutkan disebut ____ (6 huruf).” Klik potongan keempat di sisi dalam pintu bilik. Playfair, kunci `MEDIAN` dengan I/J satu sel. | `TUSAF TRIAH IUTLD PRBYF PG` | `STUDIO TEMPAT SOAL KETIGA` | Studio / potongan keempat di pintu bilik | 1. Huruf dibaca berpasangan.<br>2. Kunci adalah nilai tengah data terurut.<br>3. Kotak kunci ditampilkan. |
| 5 / Studio | Klik proyektor yang menampilkan “Soal 3” sebagai simbol Pigpen dan grid pudar; klik balik layar setelah jawaban benar untuk mengambil potongan kelima. Pakai pemetaan slide 17–18. | Rangkaian simbol SVG Pigpen yang mengode tepat `KEMBALIKEKELASTUJUHSEBELASA`, dengan batas kata visual yang tidak mengubah pemetaan; jangan ganti dengan teks plaintext di layar soal. | `KEMBALI KE KELAS TUJUH SEBELAS A` | Kembali ke 7.11A / potongan kelima di balik layar | 1. Ini substitusi simbol.<br>2. Kotak pigpen ada di layar.<br>3. Titik membedakan huruf pada kotak yang sama. |
| 6 / 7.11A (boss) | Klik lima potongan yang kini tersusun dan papan matriks `[[3,3],[2,5]]`. Hill 2×2 dengan pasangan huruf dan invers modulo 26. Siluet Bu Probabilita memegang spidol. | `DFOEEL` | `ABSEN` atau `ABSENX` (X padding) | Lembar absen utuh; lift hanya terbuka setelah Ucok menandatangani / tidak ada potongan baru | 1. Huruf diproses berpasangan dengan matriks.<br>2. Ubah huruf menjadi angka dengan A=0.<br>3. Matriks invers modulo 26 adalah baris pertama 15 dan 17, baris kedua 20 dan 9. |

**Koreksi terkontrol dari Plan 2:** naskah Pantry memberi pemain potongan *kedua* tetapi plaintext asal menyebut “LEMBAR KEDUA DI RUANG BACA”. Agar potongan berikutnya benar-benar *ketiga*, jawaban tahap 2 diubah menjadi `LEMBAR KETIGA DI RUANG BACA`, dan ciphertext Rail Fence 6 dihitung ulang menjadi `LGAEIABCMTDGABEINAKRARU` (pengelompokan tampilan seperti di tabel). Lima ciphertext lain tetap mengikuti Plan 2. Jika naskah UI menyebut nomor potongan di Pantry, gunakan “ketiga”.

Kisi Playfair untuk `MEDIAN` sesuai lampiran sumber:

```text
M E D I A
N B C F G
H K L O P
Q R S T U
V W X Y Z
```

Setelah memecahkan `DFOEEL`, pemain melihat lembar absen utuh dengan kolom kosong. Pemain dapat menggores tanda tangan lewat sentuhan **atau** menekan tombol **Tanda tangani sebagai Ucok** lewat keyboard. Baru setelah tindakan itu lift menyala. Penutup mengungkap Bu Probabilita tidak jahat: kuis kemarin sepi karena banyak yang membolos; ia ingin satu tanda tangan agar kelas tidak dibatalkan. Ucok tercatat hadir 100 persen, nilai kuisnya “ditunda”, lalu bangun pagi di 7.11A dengan soal yang persis sama di papan. Angka 100 persen di sini bagian dari cerita, bukan statistik produk.

## Aturan cerita, Lab, dan pemulihan

1. Hanya satu tahap aktif. Klik objek berlabel untuk membuka soal, kunci, atau ciphertext; objek yang belum diperiksa punya keadaan “belum ditemukan”. Denah tidak boleh melompati jawaban. Jawaban benar menyimpan potongan, membuka pintu berikutnya, dan memindahkan tahap saat pemain memilih tujuan yang terbuka.
2. Pemeriksa jawaban mengubah huruf menjadi kapital lalu mengabaikan spasi. Pada Playfair, pemeriksa menyamakan J dengan I. Pada Hill, hanya X padding terakhir boleh dihilangkan, sehingga `ABSEN` dan `ABSENX` sama-sama benar. Masukan kosong atau mengandung karakter selain huruf A–Z dan spasi memunculkan validasi tanpa mengurangi nyawa; input valid yang salah mengurangi satu nyawa dan memberi umpan balik tanpa membuka plaintext.
3. Awal cerita: 3 nyawa dan skor 100. Saat nyawa ketiga habis, pemain langsung mengulang **tahap aktif** dengan 3 nyawa baru; potongan/tahap sebelumnya dan skor tidak hilang, hint yang terbuka tetap terbuka. Salah jawab tidak memotong skor selain nyawa. Hint dibuka berurutan 1 lalu 2 lalu 3, memotong skor sekali masing-masing 5, 10, 20; skor dibatasi minimum 0. Hint yang sudah terbuka bisa dibaca lagi tanpa biaya.
4. Timer cerita menampilkan waktu berlalu, termasuk setelah kembali dari halaman lain; target 8–12 menit hanya panduan demo. Waktu habis tidak menutup ruangan atau mengakhiri cerita. Tombol **Mulai Ulang** meminta konfirmasi, lalu menghapus hanya progres cerita dan memulai tahap 1 dengan soal yang sama.
5. `localStorage` menyimpan tahap, nyawa, skor, tingkat hint per tahap, potongan yang didapat, status akhir/tanda tangan, dan waktu cerita yang telah berlalu pada browser itu. Saat tab ditutup atau halaman dimuat ulang, **Lanjutkan Cerita** mengembalikan kondisi tersebut tanpa membuka hint baru atau memotong skor lagi. Bila storage tak tersedia, penuh, atau datanya rusak, cerita tetap berjalan dengan state memori; tampilkan pesan “Progres tidak tersimpan di browser ini”. Data rusak tidak boleh membuat pemain terjebak. Tidak ada akun atau data pribadi; jawaban/kunci yang ada di client tidak diklaim rahasia.

Lab dapat dibuka dari **setiap** ruangan tanpa biaya atau perubahan tahap. Ia mengajarkan cara, memberi tempat mencoba langkah, dan tidak mengisi kolom jawaban cerita secara otomatis:

- Caesar: roda geser huruf dan arah balik sebesar 4.
- Rail Fence: letakkan huruf ciphertext pada pola zigzag enam baris lalu baca urutan aslinya.
- Vigenère: sejajarkan kunci `MODUS` berulang dengan huruf ciphertext dan lihat pengurangan per kolom.
- Playfair: tampilkan kisi `MEDIAN`, cara membentuk pasangan, aturan baris/kolom/persegi panjang, dan kesetaraan I/J; hint ketiga membuka kisi tanpa mengisi jawaban.
- Pigpen: legenda persis dari slide 17–18, simbol SVG dengan deskripsi bentuk/titik yang dapat dibaca tanpa mengandalkan warna.
- Hill: konversi A=0–Z=25, pasangan huruf, perkalian matriks, dan modulo 26; hint ketiga menyediakan invers `[[15,17],[20,9]]`. Pemain memasukkan **satu pasangan** ciphertext sebelum Lab menunjukkan perhitungan dan dua huruf hasil pasangan itu. Lab tidak menampilkan seluruh `ABSENX` sekaligus atau mengirimkannya ke input jawaban.

## Guess Message untuk presentasi

Mode ini independen dari cerita dan tersedia dari landing sebelum cerita tamat. Satu layar/proyektor, satu host, dua kelompok A dan B; tidak ada akun, jaringan, matchmaking, atau skor permanen. Pesan tetap berbeda dari keenam jawaban cerita: `KOPI PANTRY HILANG LAGI`. Gunakan Rail Fence **3 rail** yang benar-benar dihitung; tampilkan ciphertext `KPRLL OIATY IAGAI PNHNG` (spasi hanya pengelompokan visual), label algoritma, jumlah rail, dan area tebakan. Jangan ungkap plaintext sebelum jawaban benar atau waktu habis.

Host menekan **Mulai Ronde** untuk memulai hitung mundur 60 detik, memilih **Kelompok A** atau **Kelompok B** sesuai penebak yang berbicara, lalu mengetik jawabannya. Tebakan dinormalisasi seperti huruf/spasi pada cerita; input kosong atau karakter lain mendapat validasi. Tebakan sah yang salah bisa dicoba lagi selama waktu tersisa tanpa nyawa atau pengurangan skor cerita. Bila tebakan cocok dengan `KOPIPANTRYHILANGLAGI`, hentikan timer dan tampilkan kelompok terpilih sebagai pemenang. Saat timer mencapai nol, kunci jawaban baru dan ungkap `KOPI PANTRY HILANG LAGI`; tidak ada pemenang. **Ulangi Ronde** mengembalikan pesan, timer, dan pemilihan kelompok ke kondisi awal tanpa mengubah `localStorage` cerita. Aksi kembali ke landing selalu tersedia.

## Arah visual dan akses

Ruang kampus 2D pixel-art retro punya penanda spesifik per tahap: papan tulis, kulkas, buku, cermin, proyektor, lalu papan matriks boss. Jam 02.14 menegaskan premis; denah menunjukkan tujuan aktif; lima sobekan absen membentuk indikator progres yang berkaitan dengan cerita, bukan dekorasi generik. Tata letak menempatkan objek dan pertanyaan sebagai fokus tiap layar, memberi ruang baca untuk Lab dan hasilnya; jangan membuat logo, testimoni, atau klaim merek yang tidak tersedia. Aksen visual dipakai pada objek yang dapat diperiksa dan pintu yang baru terbuka, dengan teks tetap menjelaskan statusnya. Piksel membangun suasana, teks biasa menjaga keterbacaan.

Semua kontrol punya label terlihat, termasuk objek yang digambar sebagai hotspot: pemain bisa mencapai kontrol dengan Tab/Shift+Tab dan mengaktifkannya dengan Enter/Space. Fokus tampak jelas; dialog konfirmasi dapat ditutup dengan Escape. Kontras teks memenuhi WCAG AA (4,5:1 untuk teks biasa, 3:1 untuk teks besar). Simbol Pigpen memiliki deskripsi bentuk/titik dan legenda tekstual, tanpa label huruf tersembunyi yang langsung membocorkan solusi. Pada ponsel, teks dan kontrol tidak terpotong atau menimbulkan gulir horizontal, dan target sentuh minimal 44 px; pada proyektor, teks soal, timer, dan status kelompok tetap terbaca. Animasi pintu/jam boleh menandai perubahan status tetapi tidak menyembunyikan petunjuk; hormati preferensi reduced motion. Padanan keyboard untuk tanda tangan wajib tersedia.

Tiap layar memperlihatkan keadaan yang relevan: sebelum objek ditemukan, saat pemain mencoba jawaban, jawaban valid salah, input tidak sah, nyawa habis lalu tahap aktif dimulai lagi, hint baru terbuka, progres dipulihkan atau gagal disimpan, dan tamat. Halaman pelajaran menyediakan input awal serta pesan saat input/parameter tidak sah; karena tidak mengambil data jaringan, jangan tampilkan loading palsu. Navigasi dan tombol hanya tampil jika punya tindakan yang bekerja.

## Kriteria penerimaan

| Alur | Pemeriksaan yang harus lolos saat implementasi |
| --- | --- |
| Struktur/offline | Buka `index.html`, `metode.html`, `game.html`, `guess.html` melalui tautan relatif tanpa server atau internet; semua navigasi yang ditampilkan berfungsi. Catat risiko slide 27 tentang satu halaman saat penyerahan. |
| Landing | Premis 02.14 dan tiga aksi terlihat; Guess bisa dibuka tanpa tamat cerita; tombol Mulai berubah menjadi Lanjutkan ketika ada progres; tidak ada spoiler jawaban demo atau twist. |
| Pelajaran | Ubah input dan parameter setiap metode di tabel: Caesar, Scytale, Vigenère, Pigpen, steganografi teks, Rail Fence, Playfair, Hill menghasilkan hasil/langkah yang sesuai; diagram simetris/asimetris dan Enigma berubah lewat kontrol; tiga hash menampilkan simulasi konsep dan status verifikasi tanpa hash palsu. MD5 dinyatakan tidak aman untuk password. |
| Enam tahap | Setiap objek wajib pada tabel dapat diperiksa; jawaban benar sesuai ciphertext/pemetaan membuka hanya tujuan berikutnya; potongan 1–5 tercatat; Pigpen merujuk varian slide 17–18. Pantry mengungkap `LEMBAR KETIGA DI RUANG BACA`, bukan nomor lama. |
| Jawaban/nyawa | Input `ke pantry dulu` dan `KEPANTRYDULU` sama-sama menyelesaikan Caesar; input kosong atau `KE-PANTRY` tidak mengurangi nyawa; tiga jawaban sah yang salah mengulang hanya tahap aktif dengan 3 nyawa, mempertahankan potongan, skor, dan hint. Playfair menyamakan J/I; Hill menerima `ABSEN` dan `ABSENX`. |
| Skor, hint, timer | Membuka hint tahap yang sama berurutan memotong 5, 10, 20 sekali saja; membaca ulang gratis, skor minimum 0. Timer cerita tidak memicu game over setelah 12 menit. Lab tersedia di setiap tahap tanpa mengisi jawaban; pada boss ia hanya menghitung pasangan yang dimasukkan. |
| Progres/akhir | Muat ulang di tengah permainan: tahap, nyawa, hint, skor, potongan, dan waktu kembali; kegagalan storage tetap mengizinkan permainan dengan pesan jelas. Mulai Ulang meminta konfirmasi dan mereset hanya cerita. `DFOEEL` didekripsi menjadi `ABSENX`; tanda tangan Ucok melalui sentuhan **atau tombol keyboard** membuka lift dan adegan pagi dengan soal yang sama. |
| Guess | Dari landing, host memulai 60 detik, memilih A/B, memasukkan `KOPI PANTRY HILANG LAGI` atau tanpa spasi dan melihat kelompok itu menang; pada 0 detik jawaban terungkap tanpa pemenang. Ulangi Ronde memulai soal identik, progres cerita tidak berubah. |
| Aksesibilitas | Semua objek, hint, aksi Lab, denah, formulir, pilihan kelompok, dan tanda tangan dapat dipakai dengan keyboard dan fokus terlihat; bentuk/titik Pigpen punya deskripsi, kontras memenuhi AA, ponsel tidak overflow, animasi menghormati reduced motion. |
