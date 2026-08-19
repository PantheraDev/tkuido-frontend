// src/config/navigation.ts
// Secciones de la landing compartidas entre el Header y el Footer, para que
// ambos naveguen a los mismos anchors en vez de mantener dos listas.
export const sections = [
  { label: "Servicios", id: "services" },
  { label: "Planes", id: "planes" },
  { label: "Sobre Nosotros", id: "sobre-nosotros" },
  { label: "Preguntas Frecuentes", id: "preguntas-frecuentes" },
  { label: "Contacto", id: "contacto" },
];

export const getSectionHref = (id: string): string =>
  `${import.meta.env.BASE_URL}#${id}`;
