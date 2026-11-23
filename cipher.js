(function (root) {
  'use strict';

  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function normalize(input) {
    if (typeof input !== 'string') return null;
    if (!/^[A-Za-z ]+$/.test(input)) return null;
    var compact = input.toUpperCase().replace(/ /g, '');
    return compact || null;
  }

  function requireText(text) {
    var normalized = normalize(text);
    if (normalized === null) throw new TypeError('Teks harus berisi huruf A-Z dan spasi.');
    return normalized;
  }

  function requireShift(shift) {
    if (!Number.isInteger(shift)) throw new TypeError('Pergeseran harus bilangan bulat.');
    return ((shift % 26) + 26) % 26;
  }

  function requireKey(key) {
    var normalized = requireText(key);
    return normalized;
  }

  function mod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function caesar(text, shift, decrypt) {
    var value = requireText(text);
    var amount = requireShift(shift) * (decrypt ? -1 : 1);
    var out = '';
    for (var i = 0; i < value.length; i += 1) {
      out += ALPHABET[mod(value.charCodeAt(i) - 65 + amount, 26)];
    }
    return out;
  }

  function scytale(text, columns, decrypt) {
    var value = requireText(text);
    if (!Number.isInteger(columns) || columns < 1) throw new TypeError('Jumlah kolom harus bilangan bulat positif.');
    var length = value.length;
    var rows = Math.ceil(length / columns);
    var out = '';
    if (!decrypt) {
      for (var col = 0; col < columns; col += 1) {
        for (var row = 0; row < rows; row += 1) {
          var index = row * columns + col;
          if (index < length) out += value[index];
        }
      }
      return out;
    }
    var fullRows = Math.floor(length / columns);
    var longColumns = length % columns;
    var cursor = 0;
    var grid = new Array(length);
    for (var c = 0; c < columns; c += 1) {
      var columnLength = fullRows + (c < longColumns ? 1 : 0);
      for (var r = 0; r < columnLength; r += 1) {
        grid[r * columns + c] = value[cursor++];
      }
    }
    for (var g = 0; g < grid.length; g += 1) out += grid[g];
    return out;
  }

  function vigenere(text, key, decrypt) {
    var value = requireText(text);
    var keyText = requireKey(key);
    var out = '';
    for (var i = 0; i < value.length; i += 1) {
      var direction = decrypt ? -1 : 1;
      var shift = keyText.charCodeAt(i % keyText.length) - 65;
      out += ALPHABET[mod(value.charCodeAt(i) - 65 + direction * shift, 26)];
    }
    return out;
  }

  function rail(text, rails, decrypt) {
    var value = requireText(text);
    if (!Number.isInteger(rails) || rails < 2) throw new TypeError('Jumlah rail harus bilangan bulat minimal dua.');
    if (rails >= value.length) return value;
    var pattern = new Array(value.length);
    var row = 0;
    var direction = 1;
    for (var i = 0; i < value.length; i += 1) {
      pattern[i] = row;
      if (row === 0) direction = 1;
      else if (row === rails - 1) direction = -1;
      row += direction;
    }
    if (!decrypt) {
      var rows = new Array(rails);
      for (var r = 0; r < rails; r += 1) rows[r] = '';
      for (var p = 0; p < value.length; p += 1) rows[pattern[p]] += value[p];
      return rows.join('');
    }
    var counts = new Array(rails).fill(0);
    for (var j = 0; j < pattern.length; j += 1) counts[pattern[j]] += 1;
    var starts = new Array(rails);
    var offset = 0;
    for (var k = 0; k < rails; k += 1) {
      starts[k] = offset;
      offset += counts[k];
    }
    var used = new Array(rails).fill(0);
    var plain = '';
    for (var n = 0; n < pattern.length; n += 1) {
      var targetRow = pattern[n];
      plain += value[starts[targetRow] + used[targetRow]++];
    }
    return plain;
  }

  function playfairGrid(key) {
    var keyText = requireKey(key).replace(/J/g, 'I');
    var seen = Object.create(null);
    var grid = '';
    var source = keyText + 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < source.length; i += 1) {
      var letter = source[i];
      if (!seen[letter]) {
        seen[letter] = true;
        grid += letter;
      }
    }
    return grid;
  }

  function playfair(text, key, decrypt) {
    var value = requireText(text).replace(/J/g, 'I');
    var grid = playfairGrid(key);
    var positions = Object.create(null);
    for (var i = 0; i < grid.length; i += 1) positions[grid[i]] = [Math.floor(i / 5), i % 5];
    var pairs = [];
    if (decrypt) {
      if (value.length % 2 !== 0) throw new TypeError('Ciphertext Playfair harus memiliki jumlah huruf genap.');
      for (var d = 0; d < value.length; d += 2) pairs.push([value[d], value[d + 1]]);
    } else {
      for (var p = 0; p < value.length;) {
        var first = value[p];
        if (p + 1 >= value.length) {
          pairs.push([first, first === 'X' ? 'Q' : 'X']);
          p += 1;
        } else if (first === value[p + 1]) {
          pairs.push([first, first === 'X' ? 'Q' : 'X']);
          p += 1;
        } else {
          pairs.push([first, value[p + 1]]);
          p += 2;
        }
      }
    }
    var step = decrypt ? -1 : 1;
    var out = '';
    for (var q = 0; q < pairs.length; q += 1) {
      var a = positions[pairs[q][0]];
      var b = positions[pairs[q][1]];
      if (!a || !b) throw new TypeError('Huruf tidak tersedia pada kisi Playfair.');
      if (a[0] === b[0]) {
        out += grid[a[0] * 5 + mod(a[1] + step, 5)];
        out += grid[b[0] * 5 + mod(b[1] + step, 5)];
      } else if (a[1] === b[1]) {
        out += grid[mod(a[0] + step, 5) * 5 + a[1]];
        out += grid[mod(b[0] + step, 5) * 5 + b[1]];
      } else {
        out += grid[a[0] * 5 + b[1]];
        out += grid[b[0] * 5 + a[1]];
      }
    }
    return out;
  }

  function gcd(a, b) {
    while (b) {
      var next = a % b;
      a = b;
      b = next;
    }
    return a;
  }

  function modInverse(value, modulus) {
    for (var candidate = 1; candidate < modulus; candidate += 1) {
      if (mod(value * candidate, modulus) === 1) return candidate;
    }
    throw new TypeError('Determinan matriks tidak memiliki invers modulo 26.');
  }

  function hill(text, matrix, decrypt) {
    var value = requireText(text);
    if (!Array.isArray(matrix) || matrix.length !== 2 || !Array.isArray(matrix[0]) || !Array.isArray(matrix[1]) || matrix[0].length !== 2 || matrix[1].length !== 2) {
      throw new TypeError('Matriks Hill harus berukuran 2x2.');
    }
    for (var r = 0; r < 2; r += 1) {
      for (var c = 0; c < 2; c += 1) {
        if (!Number.isInteger(matrix[r][c])) throw new TypeError('Elemen matriks harus bilangan bulat.');
      }
    }
    if (!decrypt && value.length % 2) value += 'X';
    if (decrypt && value.length % 2) throw new TypeError('Ciphertext Hill harus memiliki jumlah huruf genap.');
    var a = mod(matrix[0][0], 26);
    var b = mod(matrix[0][1], 26);
    var c2 = mod(matrix[1][0], 26);
    var d = mod(matrix[1][1], 26);
    var determinant = mod(a * d - b * c2, 26);
    if (gcd(determinant, 26) !== 1) throw new TypeError('Determinan matriks harus relatif prima dengan 26.');
    if (decrypt) {
      var inverseDeterminant = modInverse(determinant, 26);
      var oldA = a;
      a = mod(d * inverseDeterminant, 26);
      b = mod(-b * inverseDeterminant, 26);
      c2 = mod(-c2 * inverseDeterminant, 26);
      d = mod(oldA * inverseDeterminant, 26);
    }
    var out = '';
    for (var i = 0; i < value.length; i += 2) {
      var x = value.charCodeAt(i) - 65;
      var y = value.charCodeAt(i + 1) - 65;
      out += ALPHABET[mod(a * x + b * y, 26)];
      out += ALPHABET[mod(c2 * x + d * y, 26)];
    }
    return out;
  }

  function pigpenGlyph(letter) {
    var value = normalize(letter);
    if (!value || value.length !== 1) throw new TypeError('Pigpen memerlukan satu huruf A-Z.');
    var index = ALPHABET.indexOf(value);
    var dotted = index >= 9 && index <= 17 || index >= 22;
    var paths = [
      'M3 35H35V3', 'M3 3V35H35V3', 'M3 3V35H35',
      'M3 3H35V35H3', 'M3 3H35V35H3V3', 'M35 3H3V35H35',
      'M3 3H35V35', 'M3 35V3H35V35', 'M35 3H3V35'
    ];
    var path;
    var dotX = 19;
    var dotY = 19;
    var trianglePaths = ['M3 3L19 19L35 3', 'M3 3L19 19L3 35', 'M35 3L19 19L35 35', 'M3 35L19 19L35 35'];
    if (index < 18) {
      path = paths[index % 9];
    } else {
      var triangleIndex = (index - 18) % 4;
      path = trianglePaths[triangleIndex];
      if (dotted) {
        var dotPositions = [[19, 9], [10, 19], [28, 19], [19, 28]];
        dotX = dotPositions[triangleIndex][0];
        dotY = dotPositions[triangleIndex][1];
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" role="img" aria-hidden="true"><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>' + (dotted ? '<circle cx="' + dotX + '" cy="' + dotY + '" r="2.5" fill="currentColor"/>' : '') + '</svg>';
  }

  function pigpenDescription(letter) {
    var value = normalize(letter);
    if (!value || value.length !== 1) throw new TypeError('Pigpen memerlukan satu huruf A-Z.');
    var index = ALPHABET.indexOf(value);
    var dot = index >= 9 && index <= 17 || index >= 22;
    var positions = ['pojok kiri atas', 'bagian atas tengah', 'pojok kanan atas', 'bagian tengah kiri', 'bagian tengah', 'bagian tengah kanan', 'pojok kiri bawah', 'bagian bawah tengah', 'pojok kanan bawah'];
    var forms = ['batas bawah dan kanan', 'batas kiri, bawah, dan kanan', 'batas kiri dan bawah', 'batas atas, kanan, dan bawah', 'batas keempat sisi', 'batas atas, kiri, dan bawah', 'batas atas dan kanan', 'batas kiri, atas, dan kanan', 'batas atas dan kiri'];
    var triangleForms = ['wedge atas', 'wedge kiri', 'wedge kanan', 'wedge bawah'];
    var description = index < 18 ? forms[index % 9] + ', posisi ' + positions[index % 9] : triangleForms[(index - 18) % 4];
    return description + (dot ? ', bertitik' : ', tanpa titik');
  }
  root.KuisCipher = {
    normalize: normalize,
    caesar: caesar,
    scytale: scytale,
    vigenere: vigenere,
    rail: rail,
    playfair: playfair,
    playfairGrid: playfairGrid,
    hill: hill,
    pigpenGlyph: pigpenGlyph,
    pigpenDescription: pigpenDescription
  };
}(window));

