const message = document.querySelector("#message");
if (location.protocol === "file:") {
  message.textContent =
    "Ouvre ce dossier avec un serveur local (voir README.md), puis visite http://localhost:8000. Le double-clic sur index.html ne suffit pas.";
} else {
  import("./main.js")
    .then(({ start }) => start())
    .catch((error) => {
      console.error(error);
      message.hidden = false;
      message.textContent =
        "La maison 3D ne peut pas démarrer. Vérifie les fichiers du dossier vendor, puis active l’accélération graphique de ton navigateur. Détails dans la console (F12).";
    });
}
