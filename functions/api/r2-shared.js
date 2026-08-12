export function getR2(env) {
  return env.MODELOS_3D || env.R2 || env.BUCKET || env.ASSETS_R2 || null;
}

export function safePart(value, fallback = "arquivo") {
  const text = String(value || "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return text.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 120) || fallback;
}

export function contentTypeFor(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".3mf")) return "application/vnd.ms-package.3dmanufacturing-3dmodel+xml";
  if (n.endsWith(".stl")) return "model/stl";
  if (n.endsWith(".obj")) return "model/obj";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}
