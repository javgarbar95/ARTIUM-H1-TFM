import { Database, University, User } from "../domain/models";
export const universities: University[] = [
  {
    id: "ucm",
    name: "Universidad Complutense de Madrid",
    shortName: "UCM",
    city: "Madrid",
  },
  {
    id: "upv",
    name: "Universitat Politècnica de València",
    shortName: "UPV",
    city: "València",
  },
  {
    id: "ugr",
    name: "Universidad de Granada",
    shortName: "UGR",
    city: "Granada",
  },
];
export const users: User[] = [
  {
    id: "demo-alba",
    displayName: "Alba Martín",
    role: "student",
    universityId: "ucm",
    bio: "Investigo el encuentro entre el color, la materia y la memoria. Este es mi cuaderno abierto.",
    initials: "AM",
    color: "#EDE4FC",
  },
  {
    id: "demo-leo",
    displayName: "Leo Navarro",
    role: "student",
    universityId: "upv",
    bio: "Formas que dialogan con el espacio. Ilustración y experimentación visual.",
    initials: "LN",
    color: "#E1ECE9",
  },
  {
    id: "demo-ines",
    displayName: "Inés Romero",
    role: "student",
    universityId: "ugr",
    bio: "Luz, ritmo y pequeños paisajes imaginados.",
    initials: "IR",
    color: "#F4E5DA",
  },
];
const timestamp = "2026-11-10T12:00:00.000Z";
const fixtures = [
  [
    "a1",
    "demo-alba",
    "Entre planos",
    "Pintura",
    "Estudio digital de color",
    "Composición sobre la convivencia de planos cálidos y fríos. Una exploración del equilibrio a través del color.",
    "Planos terracota, azules y crema con un círculo de luz.",
  ],
  [
    "a2",
    "demo-leo",
    "Órbita suave",
    "Ilustración",
    "Composición digital",
    "Un recorrido circular donde las formas se acercan sin llegar a tocarse.",
    "Arcos lilas y una esfera naranja sobre un fondo claro.",
  ],
  [
    "a3",
    "demo-alba",
    "El peso del silencio",
    "Pintura",
    "Estudio de formas y textura",
    "La quietud como punto de partida. Los volúmenes encuentran su lugar entre el vacío y la sombra.",
    "Formas verticales moradas y arena sobre una superficie clara.",
  ],
  [
    "a4",
    "demo-ines",
    "Horizonte interior",
    "Ilustración",
    "Paisaje geométrico digital",
    "Un paisaje inventado a partir de capas de color y el recuerdo de la luz al final del día.",
    "Montañas superpuestas en azul y rosa con un sol pequeño.",
  ],
  [
    "a5",
    "demo-alba",
    "Ritmos de papel",
    "Ilustración",
    "Collage geométrico digital",
    "Fragmentos que construyen una secuencia. Estudio de ritmo, repetición y contraste.",
    "Semicírculos azules, rosados y negros organizados en una cuadrícula.",
  ],
  [
    "a6",
    "demo-leo",
    "Jardín mineral",
    "Ilustración",
    "Estudio digital de volúmenes",
    "La tensión entre lo orgánico y lo construido en una pequeña arquitectura imaginaria.",
    "Un arco azul y formas verdes y coral sobre un fondo color arena.",
  ],
] as const;
export function createSeed(): Database {
  return {
    schemaVersion: 1,
    session: null,
    artworks: fixtures.map(
      ([id, ownerId, title, discipline, technique, description, altText]) => ({
        id,
        ownerId,
        title,
        discipline,
        technique,
        description,
        altText,
        year: 2026,
        visibility: "public",
        imageId: id,
        updatedAt: timestamp,
      }),
    ),
    media: fixtures.map(([id]) => ({
      id,
      bundledKey: id,
      width: 960,
      height: 1120,
      mimeType: "image/png",
    })),
    portfolio: {
      schemaVersion: 1,
      ownerId: "demo-alba",
      selectedArtworkIds: ["a1", "a3"],
      templateId: "gallery",
      accentColor: "#6436C9",
      intro: "Una selección de exploraciones sobre color, forma y memoria.",
      updatedAt: timestamp,
    },
  };
}
