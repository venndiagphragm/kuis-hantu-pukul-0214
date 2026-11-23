(() => {
  'use strict';

  const KEY = 'kuis-hantu-story-v1';
  const COSTS = [5, 10, 20];
  const stages = [
    {
      room: '7.11A', cipher: 'Caesar', object: 'Papan tulis dan kertas di meja', answer: 'KEPANTRYDULU',
      ciphertext: 'OI TERXVC HYPY', shift: 4, next: 'Pantry', scrap: 'Potongan pertama',
      clues: ['Dua koin dilempar bersamaan. Berapa banyak titik sampelnya?', 'Di meja ada sobekan dengan tulisan: “Geser sebanyak jawaban Soal 1.”'] ,
      hints: ['Kunci Caesar adalah jawaban soal koin.', 'Sebutkan semua hasil lemparan dua koin.', 'Geser mundur 4 huruf.']
    },
    {
      room: 'Pantry', cipher: 'Rail Fence', object: 'Pintu kulkas', answer: 'LEMBARKETIGADIRUANGBACA',
      ciphertext: 'LGAEI ABCMT DGABE INAKR ARU', rails: 6, next: 'Ruang Baca', scrap: 'Potongan kedua',
      clues: ['Sebuah dadu dilempar. Berapa banyak titik sampelnya? Jawabannya menentukan jumlah rail.', 'Tulisan pada sobekan kulkas: huruf tidak berganti, hanya berpindah tempat.'] ,
      hints: ['Hurufnya tidak berganti, hanya berpindah tempat.', 'Jumlah rail sama dengan jawaban soal dadu.', 'Gunakan 6 rail.']
    },
    {
      room: 'Ruang Baca', cipher: 'Vigenère', object: 'Buku statistika', answer: 'CERMINTOILETBERBISIK',
      ciphertext: 'OSUGA ZHRCD QHEYJ NWVCC', key: 'MODUS', next: 'Toilet', scrap: 'Potongan ketiga',
      clues: ['Nilai yang paling sering muncul dalam data disebut ____ (5 huruf).', 'Di sela halaman terselip potongan absen ketiga. Kunci pesan adalah jawaban istilah statistika tadi.'],
      hints: ['Kuncinya sebuah istilah statistika.', 'Ukuran pemusatan data yang paling sering muncul.', 'Huruf pertama kunci adalah M.']
    },
    {
      room: 'Toilet', cipher: 'Playfair', object: 'Cermin dan sisi dalam pintu bilik', answer: 'STUDIOTEMPATSOALKETIGA',
      ciphertext: 'TUSAF TRIAH IUTLD PRBYF PG', key: 'MEDIAN', next: 'Studio', scrap: 'Potongan keempat',
      clues: ['Nilai tengah dari data yang sudah diurutkan disebut ____ (6 huruf).', 'Potongan absen keempat terselip di sisi dalam pintu bilik. Huruf I dan J memakai satu kotak.'],
      hints: ['Huruf dibaca berpasangan.', 'Kunci adalah nilai tengah data terurut.', 'Kotak kunci ditampilkan.']
    },
    {
      room: 'Studio', cipher: 'Pigpen', object: 'Proyektor', answer: 'KEMBALIKEKELASTUJUHSEBELASA',
      next: '7.11A', scrap: 'Potongan kelima',
      clues: ['Layar proyektor menampilkan soal ketiga dalam simbol Pigpen. Gunakan legenda kotak pada layar.'],
      hints: ['Ini substitusi simbol.', 'Kotak Pigpen ada di layar.', 'Titik membedakan huruf pada kotak yang sama.']
    },
    {
      room: '7.11A', cipher: 'Hill 2×2', object: 'Papan matriks dan lima potongan absen', answer: 'ABSEN',
      ciphertext: 'DFOEEL', matrix: [[3, 3], [2, 5]], next: 'Lift',
      clues: ['Lima potongan menyatu menjadi lembar absen. Papan menampilkan matriks [[3,3],[2,5]].', 'Siluet Bu Probabilita berdiri di dekat papan. Pecahkan pesan untuk melengkapi lembar absen.'],
      hints: ['Huruf diproses berpasangan dengan matriks.', 'Ubah huruf menjadi angka dengan A=0.', 'Matriks invers modulo 26 adalah baris pertama 15 dan 17, baris kedua 20 dan 9.']
    }
  ];
  const roomArt = [
    '<div class="room-art art-board" aria-hidden="true"><span class="art-frame"><i></i><i></i><i></i></span><span class="art-tray"></span></div>',
    '<div class="room-art art-fridge" aria-hidden="true"><span class="art-door"><i></i><i></i><i></i></span><span class="art-handle"></span><span class="art-magnet"></span></div>',
    '<div class="room-art art-book" aria-hidden="true"><span class="art-page"></span><span class="art-page"></span><span class="art-spine"></span><i></i><i></i><i></i></div>',
    '<div class="room-art art-mirror" aria-hidden="true"><span class="art-glass"></span><span class="art-glint"></span><span class="art-frame"></span><span class="art-foot"></span></div>',
    '<div class="room-art art-projector" aria-hidden="true"><span class="art-screen"></span><span class="art-beam"></span><span class="art-machine"><i></i></span><span class="art-leg"></span></div>',
    '<div class="room-art art-matrix" aria-hidden="true"><span class="art-board"><i></i><i></i><i></i><i></i></span><span class="art-chalk"></span></div>'
  ];

  const content = document.getElementById('game-content');
  const gameStatus = document.getElementById('game-status');
  const storageStatus = document.getElementById('storage-status');
  if (!content || !window.KuisCipher) {
    if (gameStatus) gameStatus.textContent = 'Permainan tidak dapat dimulai. Pastikan cipher.js tersedia di folder yang sama.';
    return;
  }

  const blankState = () => ({
    stage: 0, lives: 3, score: 100, hints: [0, 0, 0, 0, 0, 0], scraps: [],
    found: [[], [], [], [], [], []], solved: [], door: 0,
    signed: false, ending: false, elapsed: 0, updatedAt: Date.now()
  });
  let state = blankState();
  let memoryOnly = false;
  let sessionStart = Date.now();
  let notice = '';
  let labResult = '';

  const validState = value => value && Number.isInteger(value.stage) && value.stage >= 0 && value.stage <= 5 &&
    Number.isInteger(value.lives) && value.lives >= 1 && value.lives <= 3 &&
    Number.isInteger(value.score) && value.score >= 0 && value.score <= 100 &&
    Array.isArray(value.hints) && value.hints.length === 6 && value.hints.every(n => Number.isInteger(n) && n >= 0 && n <= 3) &&
    Array.isArray(value.scraps) && value.scraps.every(n => Number.isInteger(n) && n >= 0 && n < 5) &&
    Array.isArray(value.found) && value.found.length === 6 && value.found.every(list => Array.isArray(list) && list.every(n => Number.isInteger(n) && n >= 0 && n < 2)) &&
    Array.isArray(value.solved) && value.solved.every(n => Number.isInteger(n) && n >= 0 && n < 6) &&
    Number.isInteger(value.door) && value.door >= 0 && value.door <= 6 &&
    typeof value.signed === 'boolean' && typeof value.ending === 'boolean' && Number.isFinite(value.elapsed) && value.elapsed >= 0 && Number.isFinite(value.updatedAt);

  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (validState(parsed)) {
        state = parsed;
        state.elapsed += Math.max(0, Date.now() - state.updatedAt);
        state.updatedAt = Date.now();
      } else {
        memoryOnly = true;
        notice = 'Data progres cerita rusak. Cerita dimulai dari awal dan tidak disimpan di browser ini.';
      }
    }
  } catch (_) {
    memoryOnly = true;
    notice = 'Data progres cerita rusak atau penyimpanan tidak dapat dibaca. Cerita tetap bisa dimainkan, tetapi progres tidak disimpan.';
  }
  if (memoryOnly) storageStatus.hidden = false;

  function elapsedNow() { return state.elapsed + Date.now() - sessionStart; }
  function save() {
    state.elapsed = elapsedNow();
    sessionStart = Date.now();
    state.updatedAt = Date.now();
    if (memoryOnly) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (_) {
      memoryOnly = true;
      notice = 'Progres tidak tersimpan di browser ini. Cerita tetap bisa dimainkan.';
      storageStatus.hidden = false;
      storageStatus.textContent = notice;
    }
  }
  function setStatus(message) {
    gameStatus.textContent = message;
  }
  function normalize(value) { return value.toUpperCase().replace(/\s/g, ''); }
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }
  function safeGlyph(letter) {
    return window.KuisCipher.pigpenGlyph(letter);
  }
  function makePigpenPuzzle() {
    const words = ['KEMBALI', 'KE', 'KELAS', 'TUJUH', 'SEBELAS', 'A'];
    return words.map(word => `<span class="pigpen-word" aria-label="${word.length} simbol">${[...word].map(letter => {
      const description = window.KuisCipher.pigpenDescription(letter);
      return `<span class="pigpen-symbol"><span aria-hidden="true">${safeGlyph(letter)}</span><span class="sr-only">${esc(description)}</span></span>`;
    }).join('')}</span>`).join(' ');
  }
  function makePigpenLegend(letters, label, columns) {
    const cells = [...letters].map(letter =>
      `<span aria-label="Huruf ${letter}">${safeGlyph(letter)}<span class="sr-only">${letter}</span></span>`
    ).join('');
    return `<section aria-label="${label}"><h4>${label}</h4><div class="pigpen-grid" style="grid-template-columns:repeat(${columns},minmax(0,1fr))">${cells}</div></section>`;
  }
  function found(stage, index) { return state.found[stage].includes(index); }
  function markFound(index) {
    if (!found(state.stage, index)) state.found[state.stage].push(index);
    save();
    render();
  }
  function allCluesFound(stageIndex) {
    return state.found[stageIndex].length >= stages[stageIndex].clues.length;
  }
  function currentDestinationUnlocked() { return state.solved.includes(state.stage); }

  function render() {
    if (notice && memoryOnly) {
      storageStatus.hidden = false;
      storageStatus.textContent = notice;
    }
    if (state.ending) {
      content.innerHTML = `<section class="hero panel ending-scene"><p class="scene">Pagi, 7.11A</p><h1>Absen tercatat. Kuis ditunda.</h1><p>Bu Probabilita tidak sedang menghantui kelas. Ia ingin satu tanda tangan agar kelasnya tidak dibatalkan. Nama Ucok tercatat hadir 100 persen.</p><p>Pagi menyelinap lewat jendela kelas. Soal dua koin yang sama masih tertulis di papan.</p><section class="panel" aria-labelledby="morning-board"><h2 id="morning-board">Soal di papan tulis</h2><p>Dua koin dilempar bersamaan. Berapa banyak titik sampelnya?</p><p>Nilai kuis ditunda.</p></section><a class="button" href="index.html">Kembali ke beranda</a><button class="button" type="button" data-action="restart">Mulai ulang cerita</button></section>`;
      setStatus('Cerita selesai. Ucok terbangun di 7.11A.');
      return;
    }
    const i = state.stage;
    const stage = stages[i];
    const boss = i === 5;
    const objectLabel = boss ? 'Papan matriks dan lembar absen' : stage.object;
    const clues = stage.clues.map((clue, index) => `<li><button type="button" class="object" data-action="clue" data-index="${index}" aria-expanded="${found(i, index)}">${esc(index === 0 ? objectLabel : stage.scrap || 'Sobekan absen')}</button>${found(i, index) ? `<p class="scrap">${esc(clue)}</p>` : '<p class="status">Belum diperiksa</p>'}</li>`).join('');
    const scrapTiles = [0, 1, 2, 3, 4].map(n => `<li class="scrap${state.scraps.includes(n) ? ' found' : ''}" aria-label="${state.scraps.includes(n) ? `Potongan ${n + 1} ditemukan` : `Potongan ${n + 1} belum ditemukan`}">${state.scraps.includes(n) ? `Sobekan ${n + 1}` : '· · ·'}</li>`).join('');
    const hints = state.hints[i];
    const visibleHints = stage.hints.slice(0, hints).map((hint, index) => `<li>Petunjuk ${index + 1}: ${esc(hint)}</li>`).join('');
    const cipherDisplay = i === 4 ? `<section class="pigpen-reference" aria-labelledby="pigpen-reference-heading"><h3 id="pigpen-reference-heading">Legenda Pigpen di slide 17</h3><p>Setiap huruf memakai bentuk grid; titik membedakan set kedua. X-grid memakai empat posisi.</p><div class="split">${makePigpenLegend('ABCDEFGHI', 'A–I tanpa titik', 3)}${makePigpenLegend('JKLMNOPQR', 'J–R bertitik', 3)}${makePigpenLegend('STUV', 'X-grid S–V tanpa titik', 2)}${makePigpenLegend('WXYZ', 'X-grid W–Z bertitik', 2)}</div><p>Pesan tersandi:</p><div class="pigpen-puzzle" aria-label="Simbol Pigpen, gunakan legenda untuk membaca">${makePigpenPuzzle()}</div></section>` : `<p class="ciphertext" aria-label="Pesan tersandi">${esc(stage.ciphertext)}</p>`;
    const unlocked = currentDestinationUnlocked();
    const canMove = unlocked && (i !== 4 || state.scraps.includes(4));

    content.innerHTML = `
      <section class="hero">
        <p class="scene" data-stage="${i + 1}">Pukul 02.14 · ${esc(stage.room)}</p>
        <h1>${boss ? 'Ruang kelas, sekali lagi' : `Tahap ${i + 1}: ${esc(stage.room)}`}</h1>
        <p>Ucok terbangun di kampus yang sunyi. Bu Probabilita meninggalkan petunjuk di ruangan ini.</p>
        <div class="status" aria-label="Status cerita">Nyawa: <strong>${state.lives}</strong> · Skor: <strong>${state.score}</strong> · Waktu: <strong id="elapsed">${formatTime(elapsedNow())}</strong></div>
      </section>
      <div class="split">
        <section class="room panel" data-stage="${i + 1}" aria-labelledby="room-heading">
          <h2 id="room-heading">Ruang ${esc(stage.room)}</h2>
          ${roomArt[i]}
          <p class="scene">${boss ? 'Lima sobekan absen menunggu disatukan.' : 'Periksa benda yang ditandai untuk menemukan soal dan pesan.'}</p>
          <ol class="objects">${clues}</ol>
          <section class="map" aria-labelledby="map-heading"><h3 id="map-heading">Denah lantai</h3><p>Tujuan berikutnya: <strong>${esc(stage.next)}</strong></p>${i === 4 && unlocked && !state.scraps.includes(4) ? '<button class="button" type="button" data-action="collect-scrap">Periksa balik layar dan ambil potongan kelima</button>' : canMove && !boss ? `<button class="button" type="button" data-action="move">Masuk ke ${esc(stage.next)}</button>` : `<p class="status">${unlocked && boss ? 'Lembar absen lengkap. Tanda tangani untuk membuka lift.' : unlocked ? 'Potongan kelima sudah diambil.' : 'Pintu berikutnya masih terkunci.'}</p>`}</section>
        </section>
        <section class="panel scene" aria-labelledby="cipher-heading">
          <h2 id="cipher-heading">Pesan dari ${esc(stage.cipher)}</h2>
          <p>${allCluesFound(i) ? 'Semua benda diperiksa. Pecahkan pesan untuk membuka pintu.' : 'Periksa semua benda di ruangan untuk mengungkap pesan.'}</p>
          ${allCluesFound(i) ? cipherDisplay : '<p class="ciphertext">Pesan belum terlihat.</p>'}
          ${allCluesFound(i) && !unlocked ? `<form id="answer-form" class="result" novalidate><label for="answer">Jawaban (huruf dan spasi)</label><div class="actions"><input id="answer" name="answer" type="text" autocomplete="off" spellcheck="false" aria-describedby="answer-help" required><button class="button" type="submit">Periksa jawaban</button></div><small id="answer-help">Kapital dan spasi tidak memengaruhi jawaban. Tanda baca tidak diterima.</small></form>` : ''}
          ${unlocked ? `<p class="status" role="status">Jawaban benar. ${boss ? 'Lembar absen utuh, tandatangani untuk memanggil lift.' : `${esc(stage.scrap)} ditemukan.`}</p>` : ''}
          ${visibleHints ? `<ol class="scrap hints" aria-label="Petunjuk terbuka">${visibleHints}</ol>` : ''}
          <div class="actions"><button class="button" type="button" data-action="hint" ${hints >= 3 || unlocked ? 'disabled' : ''}>${unlocked ? 'Pesan sudah terpecahkan' : hints >= 3 ? 'Semua petunjuk terbuka' : `Buka petunjuk ${hints + 1} (−${COSTS[hints]} poin)`}</button><button class="button" type="button" data-action="lab">Buka Lab ${esc(stage.cipher)}</button></div>
        </section>
      </div>
      <section class="panel split attendance" aria-labelledby="scrap-heading"><div><h2 id="scrap-heading">Sobekan absen</h2><ol class="scraps">${scrapTiles}</ol></div><p>${state.scraps.length} dari 5 potongan terkumpul.</p></section>
      ${boss && unlocked ? signatureMarkup() : ''}
      <section class="lab panel" id="lab" hidden aria-labelledby="lab-heading"><h2 id="lab-heading">Lab ${esc(stage.cipher)}</h2><p>${labIntro(i)}</p><div id="lab-control">${labMarkup(i)}</div><p class="result" id="lab-result" aria-live="polite">${esc(labResult || 'Coba hitung langkahnya di sini. Lab tidak mengisi jawaban cerita.')}</p></section>
      <div class="actions"><button class="button" type="button" data-action="restart">Mulai Ulang</button></div>`;
    setStatus(notice || `Tahap ${i + 1} dari 6. ${state.lives} nyawa tersisa.`);
    if (boss && unlocked) attachCanvas();
  }

  function signatureMarkup() {
    return `<section class="panel result" aria-labelledby="sign-heading"><h2 id="sign-heading">Lembar absen lengkap</h2><p>Tandatangani dengan sentuhan, atau gunakan tombol yang bisa diaktifkan dengan keyboard.</p><canvas id="signature-pad" width="360" height="100" aria-label="Area tanda tangan Ucok"></canvas><div class="actions"><button class="button" type="button" data-action="sign">Tanda tangani sebagai Ucok</button><button class="button" type="button" data-action="lift" ${state.signed ? '' : 'disabled'}>Buka lift</button></div><p class="status" id="sign-status">${state.signed ? 'Tanda tangan tercatat. Lift terbuka.' : 'Lift menunggu tanda tangan.'}</p></section>`;
  }
  function attachCanvas() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#211b22'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    let drawing = false;
    const point = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    };
    canvas.addEventListener('pointerdown', event => { drawing = true; canvas.setPointerCapture(event.pointerId); const p = point(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    let drew = false;
    canvas.addEventListener('pointermove', event => { if (!drawing) return; const p = point(event); ctx.lineTo(p.x, p.y); ctx.stroke(); drew = true; });
    canvas.addEventListener('pointerup', () => {
      drawing = false;
      if (drew) {
        state.signed = true;
        save();
        const lift = content.querySelector('[data-action="lift"]');
        if (lift) lift.disabled = false;
        const signStatus = document.getElementById('sign-status');
        if (signStatus) signStatus.textContent = 'Tanda tangan tercatat. Lift terbuka.';
        setStatus('Ucok menandatangani lembar absen. Lift terbuka.');
      }
      drew = false;
    });
    canvas.addEventListener('pointercancel', () => { drawing = false; drew = false; });
  }
  function labIntro(i) {
    return ['Geser setiap huruf mundur pada roda alfabet. Ubah satu huruf untuk melihat hitungan.', 'Rail Fence hanya menata ulang huruf. Masukkan teks pendek untuk melihat hasil 6 rail.', 'Kunci MODUS diulang sejajar dengan teks. Coba dekripsi potongan pendek.', 'Huruf diubah berpasangan pada kisi MEDIAN. I dan J berbagi kotak.', 'Pigpen mengganti tiap huruf dengan bentuk kotak atau X-grid; titik membedakan set huruf.', 'Masukkan satu pasangan ciphertext untuk menghitung pasangan itu saja. Invers hanya terlihat setelah hint ketiga.'][i];
  }
  function labMarkup(i) {
    if (i === 0) return '<form data-lab="caesar"><label for="lab-text">Huruf atau teks</label><input id="lab-text" name="text" value="OI" required><label for="lab-shift">Geser</label><input id="lab-shift" name="shift" type="number" min="0" max="25" value="4"><button class="button" type="submit">Dekripsi langkah</button></form>';
    if (i === 1) return '<form data-lab="rail"><label for="lab-text">Teks pendek</label><input id="lab-text" name="text" value="LGAEIABC" required><label for="lab-rails">Jumlah rail</label><input id="lab-rails" name="rails" type="number" min="2" max="10" value="6"><button class="button" type="submit">Susun ulang</button></form>';
    if (i === 2) return '<form data-lab="vigenere"><label for="lab-text">Teks tersandi</label><input id="lab-text" name="text" value="OSUGA" required><label for="lab-key">Kunci</label><input id="lab-key" name="key" value="MODUS" required><button class="button" type="submit">Dekripsi langkah</button></form>';
    if (i === 3) {
      const grid = window.KuisCipher.playfairGrid('MEDIAN');
      const table = `<table aria-label="Kisi Playfair MEDIAN"><tbody>${[0, 1, 2, 3, 4].map(row => `<tr>${[...grid.slice(row * 5, row * 5 + 5)].map(letter => `<td>${esc(letter)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      return `<p>Kisi MEDIAN: ${hintsVisible(3) ? table : 'kisi terbuka setelah hint ketiga.'}</p><form data-lab="playfair"><label for="lab-text">Pasangan teks</label><input id="lab-text" name="text" value="TU" maxlength="2" required><button class="button" type="submit">Hitung pasangan</button></form>`;
    }
    if (i === 4) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const legend = `<ul class="pigpen-legend">${[...alphabet].map(letter => `<li><strong class="pigpen-letter">${letter}</strong><span class="pigpen-glyph" aria-hidden="true">${safeGlyph(letter)}</span><span class="sr-only pigpen-description">${esc(window.KuisCipher.pigpenDescription(letter))}</span></li>`).join('')}</ul>`;
      return `<p>Legenda Pigpen sesuai grid pelajaran. Huruf dan simbol dipasangkan di sini untuk belajar; pesan teka-teki hanya menampilkan bentuk.</p>${legend}<form data-lab="pigpen"><label for="lab-letter">Huruf untuk mencoba</label><input id="lab-letter" name="text" maxlength="1" value="K" required><button class="button" type="submit">Tampilkan bentuk</button></form>`;
    }
    return `<p>Matriks enkripsi: [[3,3],[2,5]]. ${hintsVisible(5) ? 'Invers modulo 26: [[15,17],[20,9]].' : 'Hint ketiga membuka matriks invers.'}</p><form data-lab="hill"><label for="lab-text">Pasangan ciphertext</label><input id="lab-text" name="text" maxlength="2" placeholder="DF" required><button class="button" type="submit">Hitung pasangan saja</button></form>`;
  }
  function hintsVisible(i) { return state.hints[i] >= 3; }

  content.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'clue') {
      markFound(Number(button.dataset.index));
      setStatus('Petunjuk ditemukan.');
    } else if (action === 'hint') {
      const i = state.stage;
      if (state.hints[i] < 3) {
        const n = state.hints[i];
        state.score = Math.max(0, state.score - COSTS[n]);
        state.hints[i] += 1;
        save(); render(); setStatus(`Petunjuk ${n + 1} terbuka. Skor: ${state.score}.`);
      }
    } else if (action === 'lab') {
      const lab = document.getElementById('lab');
      lab.hidden = !lab.hidden;
      if (!lab.hidden) lab.scrollIntoView({ block: 'nearest' });
      button.setAttribute('aria-expanded', String(!lab.hidden));
    } else if (action === 'collect-scrap') {
      if (state.stage === 4 && state.solved.includes(4) && !state.scraps.includes(4)) {
        state.scraps.push(4); save(); render(); setStatus('Potongan kelima ditemukan di balik layar. Ruang kelas terbuka di denah.');
      }
    } else if (action === 'move') {
      if (!currentDestinationUnlocked()) return;
      if (state.stage === 5) return;
      state.stage += 1; state.door = state.stage;
      labResult = ''; save(); render(); setStatus(`Masuk ke ${stages[state.stage].room}.`);
    } else if (action === 'restart') {
      if (window.confirm('Mulai ulang cerita? Progres cerita saat ini akan dihapus.')) {
        state = blankState(); sessionStart = Date.now(); labResult = ''; notice = ''; memoryOnly = false;
        storageStatus.hidden = true; storageStatus.textContent = '';
        try { localStorage.removeItem(KEY); } catch (_) { memoryOnly = true; notice = 'Progres tidak tersimpan di browser ini. Cerita tetap bisa dimainkan.'; }
        render(); setStatus('Cerita dimulai kembali dari tahap pertama.');
      }
    } else if (action === 'sign') {
      state.signed = true; save(); render(); setStatus('Ucok menandatangani lembar absen. Lift terbuka.');
    } else if (action === 'lift' && state.signed) {
      state.ending = true; save(); render(); setStatus('Lift terbuka. Ucok terbangun pada pagi hari.');
    }
  });

  content.addEventListener('submit', event => {
    const form = event.target;
    if (form.id === 'answer-form') {
      event.preventDefault();
      const input = form.elements.answer;
      const raw = input.value;
      if (!raw.trim() || !/^[a-zA-Z ]+$/.test(raw)) {
        setStatus('Masukkan huruf A sampai Z dan spasi saja. Nyawa tidak berkurang.'); input.focus(); return;
      }
      const i = state.stage;
      let attempt = normalize(raw);
      let answer = normalize(stages[i].answer);
      if (i === 3) { attempt = attempt.replace(/J/g, 'I'); answer = answer.replace(/J/g, 'I'); }
      const correct = i === 5 ? (attempt === 'ABSEN' || attempt === 'ABSENX') : attempt === answer;
      if (correct) {
        if (!state.solved.includes(i)) state.solved.push(i);
        if (i < 4 && !state.scraps.includes(i)) state.scraps.push(i);
        state.door = Math.max(state.door, i + 1);
        save(); render(); setStatus(i === 5 ? 'Pesan benar. Lembar absen utuh; sekarang tandatangani.' : i === 4 ? 'Pesan benar. Pintu kelas terbuka. Periksa balik layar untuk mengambil potongan kelima.' : `Pesan benar. ${stages[i].scrap} ditemukan, pintu ${stages[i].next} terbuka.`);
      } else {
        state.lives -= 1;
        if (state.lives <= 0) {
          state.lives = 3;
          save(); render(); setStatus('Tiga nyawa habis. Tahap ini dimulai lagi dengan 3 nyawa. Petunjuk, skor, dan sobekan tetap.');
        } else {
          save(); setStatus(`Pesan belum cocok. Nyawa tersisa: ${state.lives}. Periksa petunjuk dan coba lagi.`);
          input.value = ''; input.focus();
        }
      }
    } else if (form.matches('[data-lab]')) {
      event.preventDefault();
      const type = form.dataset.lab;
      const text = form.elements.text?.value || '';
      try {
        if (!/^[a-zA-Z ]+$/.test(text)) throw new Error('Gunakan huruf A sampai Z tanpa tanda baca.');
        let output;
        if (type === 'caesar') output = window.KuisCipher.caesar(text.replace(/\s/g, ''), Number(form.elements.shift.value), true);
        if (type === 'rail') output = window.KuisCipher.rail(text.replace(/\s/g, ''), Number(form.elements.rails.value), true);
        if (type === 'vigenere') output = window.KuisCipher.vigenere(text.replace(/\s/g, ''), form.elements.key.value, true);
        if (type === 'playfair') output = window.KuisCipher.playfair(text.replace(/\s/g, ''), 'MEDIAN', true);
        if (type === 'hill') {
          if (text.replace(/\s/g, '').length !== 2) throw new Error('Masukkan tepat satu pasangan ciphertext.');
          output = window.KuisCipher.hill(text.replace(/\s/g, ''), [[3, 3], [2, 5]], true);
        }
        if (type === 'pigpen') {
          if (!/^[a-zA-Z]$/.test(text)) throw new Error('Masukkan satu huruf A sampai Z.');
          const letter = text.toUpperCase();
          labResult = `${window.KuisCipher.pigpenDescription(letter)}. Bentuk simbol ditampilkan di bawah.`;
          const result = document.getElementById('lab-result');
          result.textContent = labResult;
          result.insertAdjacentHTML('beforeend', ` ${safeGlyph(letter)}`);
          return;
        }
        labResult = `Hasil langkah: ${output}. Ini hanya latihan mekanisme; jawaban cerita tetap harus diketik sendiri.`;
      } catch (error) {
        labResult = error.message || 'Parameter tidak valid.';
      }
      const result = document.getElementById('lab-result');
      result.textContent = labResult;
      save();
    }
  });

  window.addEventListener('beforeunload', save);
  window.addEventListener('pagehide', save);
  if (memoryOnly && notice) storageStatus.textContent = notice;
  render();
  window.setInterval(() => {
    const timer = document.getElementById('elapsed');
    if (timer) timer.textContent = formatTime(elapsedNow());
  }, 1000);
  window.setInterval(save, 5000);
})();
