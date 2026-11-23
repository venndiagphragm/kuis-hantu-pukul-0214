(() => {
  "use strict";

  const STORAGE_KEY = "kuis-hantu-story-v1";
  const storyLink = document.querySelector("#story-link");
  const storyStatus = document.querySelector("#story-status");

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const stage = Number(saved?.stage);
    if (Number.isInteger(stage) && stage >= 0 && stage <= 5) {
      storyLink.textContent = "Lanjutkan Cerita";
      storyStatus.textContent = `Progres cerita ditemukan, tahap ${stage + 1}.`;
      return;
    }
    if (localStorage.getItem(STORAGE_KEY) !== null) {
      storyStatus.textContent = "Data progres tidak dikenali. Cerita dapat dimulai dari awal.";
    }
  } catch {
    storyStatus.textContent = "Progres tidak dapat dibaca. Cerita dapat dimulai dari awal.";
  }
})();
