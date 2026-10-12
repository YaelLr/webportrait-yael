import { PORTRAIT_CONTENT } from "./portrait-content.js";

const portrait = (id, roomId, name, hint) => ({
  id,
  roomId,
  name,
  hint,
  portrait: PORTRAIT_CONTENT[roomId],
});
export const INTERACTIVE_OBJECTS = [
  portrait("entree-miroir", "entree", "Miroir", "Qui suis-je ?"),
  portrait("chambre-livre", "chambre", "Carnet", "Feuilleter ma personnalité"),
  portrait(
    "bureau-ordinateur",
    "bureau",
    "Ordinateur",
    "Explorer mes études et mes intelligences",
  ),
  portrait(
    "salon-album",
    "salon",
    "Album de loisirs",
    "Découvrir mes passions",
  ),
  portrait(
    "atelier-dossier",
    "atelier",
    "Dossier de réalisations",
    "Découvrir mes réussites",
  ),
  portrait(
    "archives-carton",
    "archives",
    "Carton de souvenirs",
    "Parcourir mes souvenirs",
  ),
  portrait(
    "jardin-projets",
    "jardin",
    "Carnet de projets",
    "Découvrir mon avenir",
  ),
];
