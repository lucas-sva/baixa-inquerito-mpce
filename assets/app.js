const MESES = [
  ["Jul/25", 5664, 2965],
  ["Ago", 5508, 2753],
  ["Set", 5902, 2821],
  ["Out", 5195, 2756],
  ["Nov", 4352, 2539],
  ["Dez", 3583, 2033],
  ["Jan/26", 5231, 2565],
  ["Fev", 5290, 2658],
  ["Mar", 4205, 2277],
  ["Abr", 3856, 1392],
  ["Mai", 4097, 2592],
  ["Jun/26", 3230, 2182],
];

const max = Math.max(...MESES.map(([, ip]) => ip));
const root = document.getElementById("chart-meses");

for (const [label, ip, den] of MESES) {
  const el = document.createElement("div");
  el.className = "month";
  el.innerHTML = `
    <strong>${label}</strong>
    <div class="track">
      <div class="bar-row">
        <div class="bar bar-ip" style="width:${(ip / max) * 100}%"></div>
        <span>${ip.toLocaleString("pt-BR")} IP</span>
      </div>
      <div class="bar-row">
        <div class="bar bar-den" style="width:${(den / max) * 100}%"></div>
        <span>${den.toLocaleString("pt-BR")} denúncia</span>
      </div>
    </div>
  `;
  root.appendChild(el);
}
