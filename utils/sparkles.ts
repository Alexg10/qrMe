/**
 * Textures de la finition Paillettes : deux grilles de points scintillants dessinées une fois en canvas
 * et posées en variables CSS (--spark-a, --spark-b) sur la racine du document.
 */
let ready = false;

function texture(seed: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 180;
  const g = c.getContext("2d");
  if (!g) return "none";
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tints = ["255,255,255", "255,255,255", "255,236,170", "180,245,255", "255,190,235"];
  for (let i = 0; i < 110; i++) {
    const x = rnd() * 180, y = rnd() * 180, r = 0.5 + rnd() * 1.5, a = 0.35 + rnd() * 0.65;
    g.fillStyle = `rgba(${tints[Math.floor(rnd() * tints.length)]},${a})`;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    if (r > 1.6) {
      g.fillRect(x - r * 2.6, y - 0.4, r * 5.2, 0.8);
      g.fillRect(x - 0.4, y - r * 2.6, 0.8, r * 5.2);
    }
  }
  return `url(${c.toDataURL()})`;
}

export function ensureSparkles() {
  if (ready || !import.meta.client) return;
  ready = true;
  const root = document.documentElement.style;
  root.setProperty("--spark-a", texture(42));
  root.setProperty("--spark-b", texture(1337));
}
