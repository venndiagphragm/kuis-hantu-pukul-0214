# Kuis Hantu Pukul 02.14

Game escape room edukasi kriptografi untuk presentasi kelas. Bantu Ucok memecahkan enam pesan dan keluar dari Gedung Nano sebelum pagi.

## Menjalankan

Tidak perlu instalasi, server, build, atau koneksi internet. Buka `index.html` di browser modern. Empat halaman memakai tautan relatif dan dapat dijalankan dari folder lokal.

## Halaman

| Berkas | Isi |
| --- | --- |
| [`index.html`](index.html) | Premis cerita, lanjutkan progres, buka pelajaran, atau langsung mulai Guess Message. |
| [`metode.html`](metode.html) | Simulasi Caesar, Scytale, Vigenère, Pigpen, steganografi teks, Rail Fence, Playfair, Hill, hash, kunci simetris/asimetris, dan alur rotor Enigma. |
| [`game.html`](game.html) | Cerita enam tahap dengan tiga nyawa, hint berbiaya skor, Lab cipher, lima sobekan absen, dan penutup. |
| [`guess.html`](guess.html) | Ronde tetap 60 detik untuk dua kelompok. Host memilih kelompok dan memasukkan tebakan yang disampaikan lisan. |

## Aturan permainan

Cerita bergerak melalui enam teka-teki: Caesar dengan geser 4, Rail Fence 6 rail, Vigenère dengan kunci `MODUS`, Playfair dengan kunci `MEDIAN`, Pigpen, lalu Hill 2×2. Jawaban tiap tahap membuka ruangan berikutnya. Setelah memecahkan Hill, tanda tangani absen untuk membuka lift.

Pemain memulai dengan tiga nyawa dan skor 100. Jawaban salah mengurangi satu nyawa; nyawa habis mengulang tahap aktif tanpa menghapus hint atau skor. Hint dibuka berurutan dengan biaya 5, 10, lalu 20 poin. Timer cerita hanya mencatat waktu berjalan dan tidak mengakhiri permainan.

Guess Message memakai satu soal Rail Fence 3 rail yang terpisah dari cerita. Jawaban benar mengumumkan kelompok pemenang; waktu habis mengungkap jawabannya. Mengulang ronde tidak mengubah progres cerita.

## Progres dan privasi

Cerita menyimpan tahap, nyawa, skor, hint, potongan absen, dan waktu di `localStorage` browser dengan kunci `kuis-hantu-story-v1`. Progres hanya tersedia pada browser/perangkat yang sama. Bila penyimpanan browser gagal, game tetap dapat dimainkan dalam memori, tetapi progres tidak bertahan setelah halaman ditutup. Situs tidak memiliki akun, backend, atau pengiriman data ke server.

Teks sandi dan kunci berada di kode sisi browser. Cipher klasik pada game adalah bahan belajar, bukan perlindungan untuk pesan rahasia. Aktivitas bcrypt, MD5, dan Argon2 hanya simulasi konsep, bukan hasil hash asli; MD5 tidak aman untuk password.

## Struktur proyek

- `cipher.js`: algoritma cipher yang dipakai game dan pelajaran.
- `landing.js`, `metode.js`, `game.js`, `guess.js`: interaksi tiap halaman.
- `style.css`: tampilan pixel-art retro yang responsif.
- `PRD_Kuis_Hantu_Pukul_0214.md`: kebutuhan produk dan kriteria penerimaan.

Untuk memeriksa sintaks JavaScript jika Node.js tersedia:

```sh
node --check cipher.js
node --check landing.js
node --check metode.js
node --check game.js
node --check guess.js
```

## Catatan tugas

Materi tugas menyebut satu halaman website, sedangkan produk ini memakai empat halaman terpisah. Konfirmasikan pilihan multi-page kepada pengampu sebelum penilaian.
