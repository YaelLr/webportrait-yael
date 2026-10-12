import { createPortraitReader } from "./portrait-reader.js";
export function createPanel({ requestRender, onClose }) {
  const dialog = document.querySelector("#object-panel");
  const title = dialog.querySelector("[data-title]"),
    text = dialog.querySelector("[data-text]");
  const image = dialog.querySelector("[data-image]"),
    feedback = dialog.querySelector("[data-feedback]");
  const action = dialog.querySelector("[data-action]"),
    audioButton = dialog.querySelector("[data-audio]");
  const readerHost = document.createElement("div");
  readerHost.hidden = true;
  dialog.append(readerHost);
  const reader = createPortraitReader(readerHost);
  const eyebrow = dialog.querySelector(".eyebrow");
  let audio = null,
    generation = 0;
  function stopAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
  }
  function close() {
    // Arrêter les médias immédiatement, sans attendre l’événement close différé.
    generation++;
    stopAudio();
    reader.clear();
    dialog.close();
  }
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.querySelector("[data-close]").addEventListener("click", close);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        close();
    }
  });
  dialog.addEventListener("close", () => {
    generation++;
    stopAudio();
    reader.clear();
    onClose();
  });
  function open(entry) {
    const { config, object } = entry;
    const token = ++generation;
    stopAudio();
    reader.clear();
    const portrait = config.portrait;
    dialog.dataset.viewer = portrait?.viewer || "legacy";
    readerHost.hidden = !portrait;
    eyebrow.textContent = portrait?.subtitle || "OBJET INTERACTIF";
    if (portrait) {
      title.textContent = portrait.title;
      for (const e of [text, image, feedback, action, audioButton])
        e.hidden = true;
      reader.open(portrait);
      dialog.showModal();
      dialog.querySelector("[data-close]").focus();
      return;
    }
    text.hidden = false;
    feedback.hidden = false;
    title.textContent = config.name;
    text.textContent = config.text || "";
    feedback.textContent = "";
    image.hidden = true;
    image.removeAttribute("src");
    image.onload = () => {
      if (token === generation) image.hidden = false;
    };
    image.onerror = () => {
      if (token === generation) {
        image.hidden = true;
        feedback.textContent = "Image indisponible.";
      }
    };
    if (config.image) {
      image.alt = config.image.alt || config.name;
      image.src = config.image.src;
    }
    action.hidden = !config.action;
    action.disabled = false;
    action.textContent = config.action?.label || "Exécuter";
    action.onclick = async () => {
      action.disabled = true;
      try {
        await config.action.run({
          object,
          close,
          setText: (value) => {
            if (token === generation) text.textContent = value;
          },
          requestRender,
        });
      } catch (error) {
        console.error(error);
        if (token === generation)
          feedback.textContent = "Cette action n’a pas pu aboutir.";
      } finally {
        if (token === generation) action.disabled = false;
        requestRender();
      }
    };
    audioButton.hidden = !config.sound;
    audioButton.textContent = "Écouter";
    audioButton.onclick = async () => {
      if (audio && !audio.paused) {
        audio.pause();
        audioButton.textContent = "Écouter";
        return;
      }
      if (!audio) {
        audio = new Audio(config.sound);
        audio.onended = () => {
          audioButton.textContent = "Réécouter";
        };
      }
      try {
        await audio.play();
        if (token === generation) audioButton.textContent = "Pause";
      } catch {
        if (token === generation)
          feedback.textContent =
            "Son indisponible ou lecture refusée par le navigateur.";
      }
    };
    dialog.showModal();
    dialog.querySelector("[data-close]").focus();
  }
  return { open, close, isOpen: () => dialog.open };
}
