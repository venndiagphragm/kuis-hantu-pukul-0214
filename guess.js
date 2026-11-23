(() => {
  "use strict";

  const answer = "KOPIPANTRYHILANGLAGI";
  const target = answer;
  const ciphertext = KuisCipher.rail(answer, 3);
  const ciphertextDisplay = document.querySelector(".scrap");
  ciphertextDisplay.textContent = ciphertext.match(/.{1,5}/g).join(" ");
  const duration = 60_000;
  const timer = document.querySelector("#timer");
  const form = document.querySelector("#guess-form");
  const input = document.querySelector("#guess-input");
  const startButton = document.querySelector("#start-button");
  const submitButton = document.querySelector("#submit-button");
  const retryButton = document.querySelector("#retry-button");
  const status = document.querySelector("#form-status");
  let startedAt = 0;
  let interval = 0;
  let state = "ready";

  function normalize(value) {
    if (!/^[a-z ]*$/i.test(value)) return null;
    const compact = value.toUpperCase().replace(/ /g, "");
    return compact || null;
  }

  function stopClock() {
    window.clearInterval(interval);
    interval = 0;
  }

  function finish(message) {
    state = "finished";
    stopClock();
    input.disabled = true;
    submitButton.disabled = true;
    startButton.disabled = true;
    retryButton.disabled = false;
    status.textContent = message;
  }

  function updateTimer() {
    const remaining = Math.max(0, duration - (Date.now() - startedAt));
    const seconds = Math.ceil(remaining / 1000);
    timer.textContent = `Waktu: ${seconds} detik`;
    if (remaining === 0) {
      finish("Waktu habis. Pesan aslinya: KOPI PANTRY HILANG LAGI.");
    }
  }

  function startRound() {
    stopClock();
    state = "running";
    startedAt = Date.now();
    timer.textContent = "Waktu: 60 detik";
    input.value = "";
    input.disabled = false;
    submitButton.disabled = false;
    startButton.disabled = true;
    retryButton.disabled = true;
    status.textContent = "Ronde berjalan. Pilih kelompok, lalu kirim tebakannya.";
    interval = window.setInterval(updateTimer, 100);
    input.focus();
  }

  startButton.addEventListener("click", startRound);
  retryButton.addEventListener("click", () => {
    stopClock();
    state = "ready";
    startedAt = 0;
    timer.textContent = "Waktu: 60 detik";
    form.querySelector('input[name="team"][value="A"]').checked = true;
    input.value = "";
    input.disabled = true;
    submitButton.disabled = true;
    startButton.disabled = false;
    retryButton.disabled = true;
    status.textContent = "Ronde siap. Tekan Mulai Ronde untuk memulai hitung mundur.";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state !== "running") return;
    updateTimer();
    if (state !== "running") return;

    const guess = normalize(input.value);
    if (input.value === "") {
      status.textContent = "Masukkan tebakan terlebih dahulu.";
      input.focus();
      return;
    }
    if (guess === null) {
      status.textContent = "Gunakan huruf A sampai Z dan spasi saja.";
      input.focus();
      return;
    }
    if (guess === target) {
      const team = new FormData(form).get("team");
      finish(`Kelompok ${team} menang! Pesan berhasil dipecahkan.`);
      return;
    }
    status.textContent = "Belum tepat. Kelompok masih boleh mencoba selama waktu tersisa.";
    input.select();
  });
})();
