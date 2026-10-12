const section = (title, prompt, text = "", media = []) => ({
  title,
  prompt,
  text,
  media,
});
export const PORTRAIT_CONTENT = {
  entree: {
    title: "Qui suis-je ?",
    subtitle: "Un premier regard",
    viewer: "page",
    sections: [
      section(
        "Présentation", 
        "",
        "Yaël LEJEUNE--RENARD, 18 ans, Saint-Nabord"
      ),
      section(
        "Trois mots pour me définir",
        "Explorateur, inventif, tenace.",
      ),
      section(
        "Le brise-glace PPP",
        "Je suis un grand fan de poker, de la cuisine et je suis deja passé à la television ",
      ),
    ],
  },
  chambre: {
    title: "Ma personnalité",
    subtitle: "Mon carnet personnel",
    viewer: "book",
    sections: [
      section(
        "Mes qualités",
        "Je suis quelqu'un de persévérant, j'essaie toujours de trouver une solution quand quelque ne fonctionne pas et j'ai du mal à abandonner. Je suis aussi très curieux, encore plus dans les domaines qui m'intéressent et j'aime comprendre pourquoi et comment les choses fonctionnes.",
      ),
      section(
        "Mes défauts",
        "Mais je peux être têtu, quand j'ai une idée en tête ou quand je pense pouvoir faire quelque chose je peux passer énormément de temps dessus mias personnellement je considère cela comme une forme de determination. Aussi, je suis impatient quand je ne comprends pas quelque chose assez vite, c'est pour ca que je préfère des explication concretes et logiques avec des exemples ",
      ),
      section(
        "Ce que je veux améliorer",
        "J’aimerais apprendre à être plus patient, notamment lorsque je ne comprends pas quelque chose du premier coup. J’ai parfois tendance à vouloir aller trop vite et à m’énerver quand je n’y arrive pas. J’aimerais aussi apprendre à prendre du recul. Quand j’ai une idée en tête, je peux passer énormément de temps dessus sans forcément me rendre compte qu’il serait parfois plus efficace de faire une pause ou d’essayer une autre méthode",
      ),
      section(
        "Mon portrait chinois",
        "",
        "SI J'ÉTAIS UN ANIMAL, JE SERAIS UN RENARD.\nParce que c'est un animal malin, curieux et débrouillard.\n\nSI J'ÉTAIS UNE COULEUR, JE SERAIS LE BLANC.\nParce que c'est une couleur simple, qui va avec tout et je suis daltonien alors au moins je ne me trompe pas de couleur. \n\nSI J'ÉTAIS UN OBJET, JE SERAIS UN PAQUET DE CARTES.\nParce qu'avec un simple paquet de cartes, on peut faire énormément de choses différentes. \n\nSI J'ÉTAIS UN LIEU, JE SERAIS UNE GRANDE VILLE ENTOURÉE DE MAGNIFIQUES PAYSAGES.\nParce que j'aime l'idée d'avoir une ville vivante, avec beaucoup de choses à découvrir et de grands espaces naturels où l'on peut profiter du calme.\n\nSI J'ÉTAIS UN PERSONNAGE FICTIF, JE SERAIS JOHN WICK.\nPour sa détermination et son amour pour ceux qui sont proches de lui.\n\nSI J'ÉTAIS UNE SAISON, JE SERAIS L'AUTOMNE.\nParce que j'aime son ambiance, les paysages qui changent de couleur et les journées agréables avec des soirées plus fraîches.",
      ),
    ],
  },
  bureau: {
    title: "Mes études et mes intelligences",
    subtitle: "Mon espace de travail",
    viewer: "computer",
    sections: [
      section(
        "Mon parcours scolaire",
        "",
        "Baccalauréat général Maths, Sciences de l'ingénieur, Maths Expertes \n\nDe plus j'ai commencé une première année de Licence Informatique que j'ai arrété car je n'aimais pas la pédagogie de la Fac.",
      ),
      section(
        "Pourquoi le BUT Informatique ?",
        "",
        "J'ai choisi le BUT car je trouve que c'est une formation qui est plus complète et plus professionnalisante, et d'autres personnes de ma famille me l'ont recommandé après être aussi passé par ce BUT  ",
      ),
      section(
        "Mes intelligences multiples",
        "",
        "Selon la théorie des intelligences multiples d’Howard Gardner, je me reconnais surtout dans l’intelligence logico-mathématique. J’aime comprendre comment les choses fonctionnent, résoudre des problèmes et chercher des solutions. \n\nJe me retrouve aussi dans l’intelligence intrapersonnelle, car je commence à mieux connaître ma manière d'apprendre. Je retiens beaucoup mieux lorsque je pratique. J'ai également une intelligence visuelle, qui m'aide à imaginer et organiser mes projets. \n\nEn revanche, l'intelligence linguistique est celle avec laquelle je suis le moins à l'aise, surtout lorsqu'il faut analyser des textes, comprendre les sous-entendus ou identifier des figures de style.",
      ),
    ],
  },
  salon: {
    title: "Mes passions et loisirs",
    subtitle: "Ce que j’aime retrouver",
    viewer: "page",
    sections: [
      section(
        "Mes jeux vidéo",
        "",
        "[Valorant](https://playvalorant.com/fr-fr/) : pour la stratégie et la communication \n[Warzone](https://www.callofduty.com/fr/warzone) : pour la rapidité et l'agilité ",
      ),
      section(
        "Mes films et séries",
        "",
        "Mon film préferé est Premier Contact, car c'est un film d'extraterrestre qui explore une vision differentes des films habituels. \nMa série préféré est Loki, car je suis un très grand fan de Marvel et j'ai adoré la manière dont la serie à été réalisé. ",
      ),
      section(
        "Mes activités et loisirs",
        "",
        "En dehors des cours je fais du badminton, et j'aide mon frère à trouver de nouvelles recettes de cuisines.",
      ),
    ],
  },
  atelier: {
    title: "Mes réussites et réalisations",
    subtitle: "De l’idée à la réalisation",
    viewer: "page",
    sections: [
      section(
        "Ma plus grande réussite",
        "",
        "Réalisation d'un nichoir connecté avec deux amis (Projet fait au lycée).",
      ),
      section(
        "Pourquoi elle compte",
        "",
        "Première fois que j'ai créé quelque chose qui a été vu et apprecié par plusieurs personnes",
      ),
      section(
        "Comment le projet a été présenté",
        "",
        "Le nichoir à été présenté lors du séminaire des cadres a Pont-à-Mousson.",
      ),
      section(
        "Ce que cela m’a appris",
        "",
        "Ce projet m'a permis d'apprendre plein de choses comme la programmation, la découpe du bois et même de l'électronique",
      ),
      section(
        "Mes autres réussites",
        "",
        "J'ai aussi modélisé et imprimé en 3d une representation du Saint-Mont à l'aide d'archives et documentation d'un musée. ",
      ),
    ],
  },
archives: {
  title: "Mes souvenirs et mon passé",
  subtitle: "Les feuilles de mes archives",
  viewer: "papers",
  sections: [
    section(
      "Mes souvenirs marquants",
      "",
      "Je suis passé à la télévision lors de la deuxieme saison du Meilleur Patissier. \nJ'ai pu monter dans la voiture de Sébastien Loeb quand j'étais petit."
    ),

    section(
      "Il y a fort longtemps",
      "Quand j'étais petit...",
      "",
      [
        {
          type: "image",
          src: "assets/images/moipetit.jpg",
          alt: "Moi petit",
          caption: "Moi petit"
        }
      ]
    ),

    section(
      "Mes créations",
      "Quelques unes de mes créations. ",
      "",
      [
        {
          type: "image",
          src: "assets/images/nichoirarriere.jpg",
          alt: "Face arriere du nichoir",
          caption: "Face arriere du nichoir"
        },
        {
          type: "image",
          src: "assets/images/nichoiravant.jpg",
          alt: "Face avant du nichoir",
          caption: "Face avant du nichoir"
        },
        {
          type: "image",
          src: "assets/images/enceinte.jpg",
          alt: "Une enceinte faite au lycée",
          caption: "Une enceinte faite au lycée"
        },
        {
          type: "image",
          src: "assets/images/monaffiche.jpg",
          alt: "Une affiche faite pour un projet d'espagnol",
          caption: "Une affiche faite pour un projet d'espagnol"
        }
      ]
    ),
    section(
      "Une belle expérience !",
      "Dans un Mirage 2000",
      "",
      [
        {
          type: "image",
          src: "assets/images/mirage2000.jpg",
          alt: "Cockpit Mirage2000",
          caption: "Poste de pilotage Mirage2000"
        }
      ]
    ),
  ],
},
  jardin: {
    title: "Mon avenir",
    subtitle: "Les idées qui prennent racine",
    viewer: "page",
    sections: [
      section(
        "Mes ambitions professionnelles",
        "Après le BUT j'aimerais faire une école d'ingénieur et me spécialiser dans l'IA.",
      ),
      section(
        "Le métier qui m’attire",
        "Le métier que j'envisage de faire plus tard est Ingénieur en IA ou DataScientist",
      ),
      section(
        "Mes objectifs personnels",
        "Je voudrais créer ma propre société dans l'IA qui soit reconnue mondialement",
      ),
      section(
        "Mes rêves",
        "Je veux voyager dans le monde entier, voir toutes les merveilles du monde actuelle et pouvoir faire profiter ma famille ",
      ),
    ],
  },
};
