(() => {
  'use strict';

  const cipher = window.KuisCipher;
  const byId = id => document.getElementById(id);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const compact = input => {
    const value = cipher.normalize(input);
    if (value === null) throw new Error('Masukkan huruf A–Z; spasi boleh digunakan.');
    return value;
  };
  const showError = (node, error) => {
    node.textContent = `Masukan belum dapat diproses: ${error.message || error}`;
  };
  const field = id => byId(id).value;
  const bind = (ids, render) => {
    const nodes = ids.map(byId);
    nodes.forEach(node => node.addEventListener('input', render));
    nodes.filter(node => node.tagName === 'SELECT').forEach(node => node.addEventListener('change', render));
    render();
  };
  const out = (id, content) => { byId(id).replaceChildren(...content); };
  const text = value => document.createTextNode(value);
  const block = (label, value) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    p.append(strong, text(value));
    return p;
  };
  const diagram = (label, value) => {
    const section = document.createElement('div');
    const heading = document.createElement('strong');
    heading.textContent = label;
    const pre = document.createElement('pre');
    pre.textContent = value;
    section.append(heading, pre);
    return section;
  };
  const setResult = (id, children) => out(id, children);
  const matrixGrid = (container, letters, label) => {
    container.replaceChildren();
    const table = document.createElement('table');
    table.setAttribute('aria-label', label);
    const body = document.createElement('tbody');
    for (let row = 0; row < 5; row += 1) {
      const tr = document.createElement('tr');
      for (let column = 0; column < 5; column += 1) {
        const td = document.createElement('td');
        td.textContent = letters[row * 5 + column] || '';
        tr.append(td);
      }
      body.append(tr);
    }
    table.append(body);
    container.append(table);
  };
  const displayGrid = grid => grid.map(row => row.map(cell => cell || '·').join(' ')).join('\n');
  const steppedGrid = (input, columns) => {
    const rows = Math.ceil(input.length / columns);
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, column) => input[row * columns + column] || '')
    );
  };


  bind(['caesar-text', 'caesar-shift', 'caesar-mode'], () => {
    const result = byId('caesar-result');
    try {
      const input = compact(field('caesar-text'));
      if (!field('caesar-shift').trim()) throw new Error('Masukkan angka geser.');
      const shift = Number(field('caesar-shift'));
      if (!Number.isInteger(shift) || shift < 0 || shift > 25) throw new Error('Geser harus bilangan bulat 0 sampai 25.');
      const decrypt = field('caesar-mode') === 'decrypt';
      const output = cipher.caesar(input, shift, decrypt);
      setResult('caesar-result', [block('Hasil', output), block('Langkah', `${decrypt ? 'Kurangi' : 'Tambah'} ${shift} pada indeks setiap huruf modulo 26.`), block('Contoh huruf', `${input[0]} (${alphabet.indexOf(input[0])}) ${decrypt ? '−' : '+'} ${shift} → ${output[0]} (${alphabet.indexOf(output[0])})`)]);
    } catch (error) { showError(result, error); }
  });

  bind(['scytale-text', 'scytale-columns', 'scytale-mode'], () => {
    try {
      const input = compact(field('scytale-text'));
      const columns = Number(field('scytale-columns'));
      if (!Number.isInteger(columns) || columns < 2 || columns > 12) throw new Error('Jumlah kolom harus bilangan bulat 2 sampai 12.');
      const decrypt = field('scytale-mode') === 'decrypt';
      const output = cipher.scytale(input, columns, decrypt);
      let grid;
      if (!decrypt) grid = steppedGrid(input, columns);
      else {
        const rows = Math.ceil(input.length / columns);
        const fullColumns = input.length % columns || columns;
        let cursor = 0;
        grid = Array.from({ length: rows }, () => Array(columns).fill(''));
        for (let column = 0; column < columns; column += 1) {
          const size = column < fullColumns ? rows : rows - 1;
          for (let row = 0; row < size; row += 1) grid[row][column] = input[cursor++] || '';
        }
      }
      setResult('scytale-result', [block('Hasil', output), block('Pola batang', `Isi ${decrypt ? 'kolom' : 'baris'} dengan ${columns} kolom; ${decrypt ? 'baca melintasi baris' : 'baca menuruni kolom'}.`), diagram('Susunan huruf', displayGrid(grid))]);
    } catch (error) { showError(byId('scytale-result'), error); }
  });

  bind(['vigenere-text', 'vigenere-key', 'vigenere-mode'], () => {
    try {
      const input = compact(field('vigenere-text'));
      const key = compact(field('vigenere-key'));
      const decrypt = field('vigenere-mode') === 'decrypt';
      const output = cipher.vigenere(input, key, decrypt);
      const repeated = input.split('').map((_, i) => key[i % key.length]).join('');
      const steps = input.slice(0, Math.min(8, input.length)).split('').map((letter, i) => `${letter}(${alphabet.indexOf(letter)}) ${decrypt ? '−' : '+'} ${repeated[i]}(${alphabet.indexOf(repeated[i])}) = ${output[i]}`).join(' · ');
      setResult('vigenere-result', [block('Hasil', output), block('Kunci sejajar', repeated), block('Operasi per kolom', steps)]);
    } catch (error) { showError(byId('vigenere-result'), error); }
  });

  bind(['rail-text', 'rail-count', 'rail-mode'], () => {
    try {
      const input = compact(field('rail-text'));
      const rails = Number(field('rail-count'));
      if (!Number.isInteger(rails) || rails < 2 || rails > 10 || rails > Math.max(2, input.length)) throw new Error('Rail harus bilangan bulat 2–10 dan tidak boleh melebihi panjang pesan.');
      const decrypt = field('rail-mode') === 'decrypt';
      const output = cipher.rail(input, rails, decrypt);
      const paths = Array.from({ length: input.length }, (_, i) => {
        const cycle = 2 * (rails - 1);
        const position = i % cycle;
        return position < rails ? position : cycle - position;
      });
      const grid = Array.from({ length: rails }, () => Array(input.length).fill(''));
      if (!decrypt) paths.forEach((row, i) => { grid[row][i] = input[i]; });
      else {
        const counts = Array(rails).fill(0);
        paths.forEach(row => { counts[row] += 1; });
        let cursor = 0;
        const rows = counts.map(count => input.slice(cursor, cursor += count).split(''));
        const offsets = Array(rails).fill(0);
        paths.forEach((row, column) => { grid[row][column] = rows[row][offsets[row]++]; });
      }
      setResult('rail-result', [block('Hasil', output), block('Zigzag', `Huruf menempati rail ${paths.slice(0, 12).map(row => row + 1).join(' → ')}${paths.length > 12 ? ' …' : ''}.`), diagram('Diagram, baca per baris untuk enkripsi', displayGrid(grid))]);
    } catch (error) { showError(byId('rail-result'), error); }
  });

  const pigpenSequence = [];
  const pigpenLegend = byId('pigpen-legend');
  const pigpenPicker = byId('pigpen-picker');
  function renderPigpenLegend() {
    pigpenLegend.replaceChildren();
    pigpenPicker.replaceChildren();
    for (const letter of alphabet) {
      const entry = document.createElement('span');
      entry.className = 'pigpen-entry';
      const glyph = document.createElement('span');
      glyph.innerHTML = cipher.pigpenGlyph(letter);
      glyph.setAttribute('role', 'img');
      glyph.setAttribute('aria-label', `Simbol Pigpen, ${cipher.pigpenDescription(letter)}`);
      entry.append(glyph, text(` ${letter}`));
      pigpenLegend.append(entry);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pigpen-choice';
      button.setAttribute('aria-label', `Pilih simbol ${cipher.pigpenDescription(letter)}`);
      button.innerHTML = cipher.pigpenGlyph(letter);
      button.addEventListener('click', () => {
        pigpenSequence.push(letter);
        byId('pigpen-sequence').textContent = `Simbol dipilih: ${pigpenSequence.filter(value => value !== ' ').length}, batas kata: ${pigpenSequence.filter(value => value === ' ').length}.`;
      });
      pigpenPicker.append(button);
    }
  }
  byId('pigpen-space').addEventListener('click', () => {
    if (pigpenSequence.length && pigpenSequence[pigpenSequence.length - 1] !== ' ') pigpenSequence.push(' ');
    byId('pigpen-sequence').textContent = `Simbol dipilih: ${pigpenSequence.filter(value => value !== ' ').length}, batas kata: ${pigpenSequence.filter(value => value === ' ').length}.`;
  });
  renderPigpenLegend();
  bind(['pigpen-text', 'pigpen-mode'], () => {
    try {
      const raw = field('pigpen-text').trim().toUpperCase();
      const input = compact(raw);
      const mode = field('pigpen-mode');
      if (mode === 'decode') throw new Error('Pilih glyph pada legenda lalu gunakan tombol Terjemahkan simbol pilihan.');
      const icons = document.createDocumentFragment();
      const words = raw.split(/\s+/);
      for (const [wordIndex, word] of words.entries()) {
        for (const letter of compact(word)) {
          const span = document.createElement('span');
          span.className = 'pigpen-entry';
          span.innerHTML = cipher.pigpenGlyph(letter);
          span.setAttribute('role', 'img');
          span.setAttribute('aria-label', `Simbol Pigpen, ${cipher.pigpenDescription(letter)}`);
          icons.append(span);
        }
        if (wordIndex < words.length - 1) icons.append(text(' / '));
      }
      setResult('pigpen-result', [block('Huruf', input), block('Urutan glyph', `${input.length} simbol dibuat sesuai huruf masukan; garis miring memisahkan kata.`), icons]);
    } catch (error) { showError(byId('pigpen-result'), error); }
  });
  byId('pigpen-mode').addEventListener('change', () => {
    byId('pigpen-text').disabled = field('pigpen-mode') === 'decode';
  });
  byId('pigpen-clear').addEventListener('click', () => {
    pigpenSequence.length = 0;
    byId('pigpen-sequence').textContent = 'Belum ada simbol dipilih.';
    byId('pigpen-result').textContent = 'Urutan simbol dikosongkan.';
  });
  byId('pigpen-decode').addEventListener('click', () => {
    if (!pigpenSequence.length) { byId('pigpen-result').textContent = 'Pilih satu atau beberapa glyph terlebih dahulu.'; return; }
    const decoded = pigpenSequence.join('');
    setResult('pigpen-result', [block('Hasil dekripsi', decoded), block('Metode', 'Setiap glyph diterjemahkan lewat pemetaan Pigpen yang sama dengan encoder.')]);
  });

  bind(['stego-text'], () => {
    const words = field('stego-text').match(/[A-Za-z]+/g) || [];
    const initials = words.map(word => word[0].toUpperCase()).join('');
    const list = document.createElement('ol');
    words.forEach(word => {
      const item = document.createElement('li');
      item.textContent = `${word} → ${word[0].toUpperCase()}`;
      list.append(item);
    });
    setResult('stego-result', [block('Huruf awal', initials || '(belum ada huruf)'), block('Pembacaan', 'Ambil huruf pertama dari setiap kata.'), list]);
  });

  bind(['playfair-text', 'playfair-key', 'playfair-mode'], () => {
    try {
      const input = compact(field('playfair-text'));
      const key = compact(field('playfair-key'));
      const decrypt = field('playfair-mode') === 'decrypt';
      const grid = cipher.playfairGrid(key);
      const output = cipher.playfair(input, key, decrypt);
      matrixGrid(byId('playfair-grid'), grid, `Kisi Playfair dengan kunci ${key}`);
      const prepared = input.replace(/J/g, 'I');
      const pairs = [];
      if (decrypt) {
        for (let i = 0; i < prepared.length; i += 2) pairs.push(prepared.slice(i, i + 2));
      } else {
        for (let i = 0; i < prepared.length;) {
          const first = prepared[i];
          if (i + 1 >= prepared.length || first === prepared[i + 1]) {
            const second = first === 'X' ? 'Q' : 'X';
            const reason = i + 1 >= prepared.length ? 'padding' : 'huruf berulang';
            pairs.push(`${first} + ${second} (${reason})`);
            i += 1;
          } else {
            pairs.push(prepared.slice(i, i + 2));
            i += 2;
          }
        }
      }
      const outputPairs = output.match(/.{2}/g) || [];
      const explanation = pairs.slice(0, 8).map((pair, i) => `${i + 1}: ${pair} → ${outputPairs[i] || '(belum ada hasil)'}`).join(' · ');
      setResult('playfair-result', [block('Hasil', output), block('Kisi', grid.match(/.{5}/g).join(' / ')), block('Pasangan siap proses → hasil', explanation || 'Belum ada pasangan.'), block('Aturan', 'Satu baris: geser mendatar. Satu kolom: geser vertikal. Selain itu: tukar sudut persegi panjang. I dan J berbagi sel.')]);
    } catch (error) { showError(byId('playfair-result'), error); }
  });

  const modulo = value => ((value % 26) + 26) % 26;
  function inverseOf(value) {
    for (let candidate = 1; candidate < 26; candidate += 1) if (value * candidate % 26 === 1) return candidate;
    throw new Error('Matriks tidak memiliki invers modulo 26.');
  }
  function inverseMatrix(matrix) {
    const determinant = modulo(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
    const factor = inverseOf(determinant);
    return [
      [modulo(matrix[1][1] * factor), modulo(-matrix[0][1] * factor)],
      [modulo(-matrix[1][0] * factor), modulo(matrix[0][0] * factor)]
    ];
  }
  bind(['hill-text', 'hill-a', 'hill-b', 'hill-c', 'hill-d', 'hill-mode'], () => {
    try {
      const input = compact(field('hill-text'));
      const matrixIds = ['hill-a', 'hill-b', 'hill-c', 'hill-d'];
      if (matrixIds.some(id => !field(id).trim())) throw new Error('Lengkapi keempat nilai matriks.');
      const matrix = [[Number(field('hill-a')), Number(field('hill-b'))], [Number(field('hill-c')), Number(field('hill-d'))]];
      if (matrix.flat().some(value => !Number.isSafeInteger(value))) throw new Error('Semua entri matriks harus bilangan bulat dalam rentang aman.');
      const decrypt = field('hill-mode') === 'decrypt';
      if (decrypt && input.length % 2 !== 0) throw new Error('Ciphertext Hill harus memiliki jumlah huruf genap.');
      const paddedInput = !decrypt && input.length % 2 ? `${input}X` : input;
      const output = cipher.hill(input, matrix, decrypt);
      const workMatrix = decrypt ? inverseMatrix(matrix) : matrix;
      const pairs = paddedInput.match(/.{2}/g) || [];
      const steps = pairs.map(pair => {
        const vector = pair.split('').map(char => alphabet.indexOf(char));
        const values = workMatrix.map(row => row.map(modulo).reduce((sum, value, i) => sum + value * vector[i], 0) % 26);
        const resultPair = values.map(value => alphabet[value]).join('');
        return `${pair} → [${vector.join(', ')}] → [${values.join(', ')}] → ${resultPair}`;
      }).join(' · ');
      const result = [block('Hasil', output)];
      if (paddedInput !== input) result.push(block('Padding', `${input} → ${paddedInput} (X ditambahkan agar jumlah huruf genap).`));
      result.push(block(decrypt ? 'Matriks invers modulo 26' : 'Matriks', `[[${workMatrix[0].join(',')}],[${workMatrix[1].join(',')}]]`), block('Perkalian per pasangan', steps || 'Masukkan pasangan huruf.'));
      setResult('hill-result', result);
    } catch (error) { showError(byId('hill-result'), error); }
  });

  function renderConceptHash(panel) {
    const result = panel.querySelector('.hash-result');
    const sample = panel.querySelector('.hash-input').value;
    const comparison = panel.querySelector('.hash-check').value;
    const saltValue = panel.querySelector('.hash-salt').value;
    const referenceSalt = panel.querySelector('.hash-reference-salt').textContent.trim();
    if (!sample.trim() || !comparison.trim()) {
      result.textContent = 'Masukkan kedua teks untuk mencoba verifikasi konsep.';
      return;
    }
    const matches = sample === comparison && saltValue === referenceSalt;
    result.textContent = `${matches ? 'Cocok' : 'Tidak cocok'} secara konseptual: teks dan salt yang diuji harus sama dengan acuan (${referenceSalt}). Salt diuji sebagai masukan tambahan; tidak ada digest yang dihitung.`;
  }
  document.querySelectorAll('#bcrypt, #md5, #argon2').forEach(panel => {
    const render = () => renderConceptHash(panel);
    panel.querySelectorAll('input').forEach(input => input.addEventListener('input', render));
    render();
  });
  bind(['hash-input', 'hash-expected', 'hash-salt'], () => {
    const sample = field('hash-input');
    const expected = field('hash-expected');
    const salt = field('hash-salt');
    const referenceSalt = byId('hash-reference-salt').textContent.trim();
    const matched = sample && expected && sample === expected && salt === referenceSalt;
    byId('hash-result').textContent = !sample || !expected
      ? 'Masukkan kedua teks untuk mencoba verifikasi konsep.'
      : `${matched ? 'Cocok' : 'Tidak cocok'} secara konseptual: teks dan salt yang diuji harus sama dengan acuan (${referenceSalt}). Tidak ada digest yang dihitung.`;
  });

  let activeKeyFlow = null;
  function renderKeyFlow(kind = activeKeyFlow) {
    const message = field('key-message');
    if (!kind || !message.trim()) {
      byId('key-result').textContent = !message.trim() ? 'Masukkan pesan untuk melihat alur kunci.' : 'Pilih satu alur untuk melihat siapa memakai kunci.';
      return;
    }
    byId('key-result').textContent = kind === 'symmetric'
      ? `Pengirim: pesan “${message}” + kunci bersama → ciphertext konseptual. Penerima memakai kunci bersama yang sama → pesan terbaca kembali. Diagram konsep, bukan enkripsi sungguhan.`
      : `Pengirim: pesan “${message}” + kunci publik penerima → ciphertext konseptual. Penerima memakai kunci privat pasangannya → pesan terbaca kembali. Diagram konsep, bukan enkripsi sungguhan.`;
  }
  byId('symmetric-button').addEventListener('click', () => { activeKeyFlow = 'symmetric'; renderKeyFlow(); });
  byId('asymmetric-button').addEventListener('click', () => { activeKeyFlow = 'asymmetric'; renderKeyFlow(); });
  byId('key-message').addEventListener('input', () => renderKeyFlow());

  bind(['enigma-letter', 'rotor-one', 'rotor-two'], () => {
    try {
      const raw = compact(field('enigma-letter'));
      const first = Number(field('rotor-one'));
      const second = Number(field('rotor-two'));
      if (raw.length !== 1) throw new Error('Masukkan tepat satu huruf A–Z.');
      if (![first, second].every(value => Number.isInteger(value) && value >= 0 && value <= 25)) throw new Error('Putaran rotor harus bilangan bulat 0 sampai 25.');
      const n = alphabet.indexOf(raw);
      const afterOne = (n + first) % 26;
      const afterTwo = (afterOne + second) % 26;
      setResult('enigma-result', [block('Alur konsep', `${raw} → rotor 1 (+${first}) ${alphabet[afterOne]} → rotor 2 (+${second}) ${alphabet[afterTwo]} → reflektor konseptual → jalur balik.`), block('Catatan', 'Angka putaran hanya mengubah diagram alur. Ini bukan pemetaan Enigma nyata dan bukan ciphertext.')]);
    } catch (error) { showError(byId('enigma-result'), error); }
  });
})();
