export function parseDate(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date;
  }
  if (typeof date === "string") {
    const clean = date.split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function formatDate(date) {
  const d = parseDate(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dateValue(date) {
  return parseDate(date).getTime();
}

