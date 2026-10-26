export const tagNumber = (id: number) => `#${String(id).padStart(4, "0")}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
