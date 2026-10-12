export function createPortraitReader(host) {
  let content = null,
    index = 0,
    revision = 0,
    busy = false,
    animation = null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const node = (tag, className, text) => {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text) e.textContent = text;
    return e;
  };
  function pauseMedia() {
    host.querySelectorAll("audio,video").forEach((a) => a.pause());
  }
  function clear() {
    revision++;
    animation?.cancel();
    animation = null;
    busy = false;
    pauseMedia();
    host.replaceChildren();
    content = null;
  }
  function safeURL(value) {
    try {
      const u = new URL(value, location.href);
      return ["http:", "https:"].includes(u.protocol) ? u.href : null;
    } catch {
      return null;
    }
  }
  function media(items, parent) {
    for (const item of items || []) {
      if (item.type === "image") {
        const src = safeURL(item.src);
        if (!src) continue;
        const figure = node("figure", "portrait-media"),
          img = node("img");
        img.src = src;
        img.alt = item.alt || item.caption || "Illustration";
        img.loading = "lazy";
        img.addEventListener(
          "error",
          () => {
            img.hidden = true;
            figure.append(node("p", "media-error", "Image indisponible."));
          },
          { once: true },
        );
        figure.append(img);
        if (item.caption || item.credit)
          figure.append(
            node(
              "figcaption",
              "",
              [item.caption, item.credit].filter(Boolean).join(" — "),
            ),
          );
        parent.append(figure);
      } else if (item.type === "audio") {
        const src = safeURL(item.src);
        if (!src) continue;
        const wrapper = node("div", "portrait-media");
        wrapper.append(node("p", "media-label", item.label || "Écouter"));
        const audio = node("audio");
        audio.controls = true;
        audio.preload = "none";
        audio.src = src;
        audio.addEventListener("play", () =>
          host.querySelectorAll("audio").forEach((a) => {
            if (a !== audio) a.pause();
          }),
        );
        audio.addEventListener(
          "error",
          () =>
            wrapper.append(
              node("p", "media-error", "Ce son est indisponible."),
            ),
          { once: true },
        );
        wrapper.append(audio);
        if (item.transcript) {
          const details = node("details");
          details.append(
            node("summary", "", "Transcription"),
            node("p", "", item.transcript),
          );
          wrapper.append(details);
        }
        parent.append(wrapper);
      } else if (item.type === "link") {
        const href = safeURL(item.url);
        if (!href) continue;
        const a = node(
          "a",
          "portrait-link",
          `${item.label || "Ouvrir le lien"} ↗`,
        );
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        parent.append(a);
      }
    }
  }
  function section(data, parent) {
    const article = node("section", "portrait-section");
    article.append(node("h3", "", data.title));
    if (data.text?.trim()) {
      const paragraph = node("p", "portrait-text");
      const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let position = 0;

      for (const match of data.text.matchAll(pattern)) {
        paragraph.append(data.text.slice(position, match.index));

        const link = document.createElement("a");
        link.textContent = match[1];
        link.href = match[2];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.color = "inherit";
        link.style.textDecoration = "underline";

        paragraph.append(link);
        position = match.index + match[0].length;
      }

      paragraph.append(data.text.slice(position));
      article.append(paragraph);
    } else {
      const placeholder = node("div", "portrait-placeholder");
      placeholder.append(
        node("p", "", data.prompt || "Ton texte viendra ici."),
      );
      article.append(placeholder);
    }
    media(data.media, article);
    parent.append(article);
  }
  function render() {
    pauseMedia();
    host.replaceChildren();
    host.className = `portrait-reader reader-${content.viewer}`;
    const sections = content.sections || [];
    const frame = node("div", "reader-frame");
    host.append(frame);
    if (content.viewer === "computer") {
      const bar = node("div", "computer-bar");
      bar.append(
        node("span", "window-lights", "● ● ●"),
        node("span", "", "MON ESPACE / ÉTUDES"),
        node("span", "computer-status", "LOCAL"),
      );
      frame.append(bar);
      const layout = node("div", "computer-layout"),
        tabs = node("div", "computer-tabs");
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Dossiers de mes études");
      sections.forEach((s, i) => {
        const b = node("button", "computer-tab", s.title);
        b.type = "button";
        b.id = `study-tab-${i}`;
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", String(i === index));
        b.setAttribute("aria-controls", "study-panel");
        b.tabIndex = i === index ? 0 : -1;
        b.onclick = () => go(i);
        b.onkeydown = (e) => {
          let next = null;
          if (e.key === "ArrowDown" || e.key === "ArrowRight")
            next = (i + 1) % sections.length;
          if (e.key === "ArrowUp" || e.key === "ArrowLeft")
            next = (i + sections.length - 1) % sections.length;
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = sections.length - 1;
          if (next !== null) {
            e.preventDefault();
            go(next);
          }
        };
        tabs.append(b);
      });
      const screen = node("div", "reader-page computer-screen");
      screen.id = "study-panel";
      screen.setAttribute("role", "tabpanel");
      screen.setAttribute("aria-labelledby", `study-tab-${index}`);
      screen.tabIndex = 0;
      if (sections[index]) section(sections[index], screen);
      layout.append(tabs, screen);
      frame.append(layout);
    } else if (content.viewer === "book" || content.viewer === "papers") {
      const layout = node("div", "reader-spread");
      if (content.viewer === "book") {
        const cover = node("aside", "book-cover");
        cover.append(
          node("p", "book-caption", "CARNET PERSONNEL"),
          node("h3", "", content.title),
        );
        const contents = node("nav");
        contents.setAttribute("aria-label", "Sommaire du carnet");
        sections.forEach((s, i) => {
          const b = node(
            "button",
            "book-chapter",
            `${String(i + 1).padStart(2, "0")} · ${s.title}`,
          );
          b.type = "button";
          b.setAttribute("aria-current", i === index ? "page" : "false");
          b.onclick = () => go(i);
          contents.append(b);
        });
        cover.append(contents);
        layout.append(cover);
      }
      const page = node("div", "reader-page");
      page.tabIndex = 0;
      page.setAttribute(
        "aria-label",
        content.viewer === "book" ? "Page du carnet" : "Feuille de souvenirs",
      );
      if (content.viewer === "papers")
        page.append(node("p", "paper-heading", "ARCHIVES PERSONNELLES"));
      if (sections[index]) section(sections[index], page);
      layout.append(page);
      frame.append(layout);
      const controls = node("div", "reader-controls");
      const prev = node("button", "", "← Précédente"),
        next = node("button", "", "Suivante →");
      prev.type = next.type = "button";
      prev.disabled = index === 0;
      next.disabled = index >= sections.length - 1;
      prev.onclick = () => go(index - 1);
      next.onclick = () => go(index + 1);
      const count = node(
        "span",
        "reader-count",
        `${content.viewer === "papers" ? "Feuille" : "Page"} ${index + 1} / ${sections.length}`,
      );
      count.setAttribute("role", "status");
      controls.append(prev, count, next);
      frame.append(controls);
    } else {
      const page = node("div", "reader-page");
      sections.forEach((s) => section(s, page));
      frame.append(page);
    }
    if (!sections.length)
      frame.append(node("p", "", "Le contenu sera ajouté ici."));
  }
  async function go(next) {
    if (
      busy ||
      !content ||
      next < 0 ||
      next >= content.sections.length ||
      next === index
    )
      return;
    const token = revision,
      forward = next > index;
    busy = true;
    pauseMedia();
    const page = host.querySelector(".reader-page"),
      animated =
        ["book", "papers"].includes(content.viewer) && !reduced.matches;
    try {
      if (animated) {
        animation = page.animate(
          [
            { transform: "rotateY(0deg)", opacity: 1 },
            { transform: `rotateY(${forward ? -75 : 75}deg)`, opacity: 0.2 },
          ],
          { duration: 160, easing: "ease-in", fill: "forwards" },
        );
        await animation.finished;
      }
      if (token !== revision) return;
      index = next;
      render();
      const fresh = host.querySelector(".reader-page");
      if (content.viewer === "computer")
        host.querySelector(`[aria-selected="true"]`).focus();
      else fresh?.focus({ preventScroll: true });
      if (animated) {
        animation = fresh.animate(
          [
            { transform: `rotateY(${forward ? 65 : -65}deg)`, opacity: 0.3 },
            { transform: "rotateY(0deg)", opacity: 1 },
          ],
          { duration: 200, easing: "ease-out" },
        );
        await animation.finished;
      }
    } catch (error) {
      if (error.name !== "AbortError") console.error(error);
    } finally {
      if (token === revision) busy = false;
    }
  }
  host.addEventListener("keydown", (e) => {
    if (
      !content ||
      !["book", "papers"].includes(content.viewer) ||
      !["ArrowLeft", "ArrowRight"].includes(e.key)
    )
      return;
    if (e.target.closest("audio,input,textarea")) return;
    e.preventDefault();
    go(index + (e.key === "ArrowRight" ? 1 : -1));
  });
  function open(data) {
    clear();
    content = data;
    index = 0;
    render();
  }
  return { open, clear };
}
