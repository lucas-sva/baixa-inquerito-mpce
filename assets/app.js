(function () {
  "use strict";

  var MESES = [
    { curto: "Jul", longo: "Jul/25", dev: 5664, den: 2965 },
    { curto: "Ago", longo: "Ago/25", dev: 5508, den: 2753 },
    { curto: "Set", longo: "Set/25", dev: 5902, den: 2821 },
    { curto: "Out", longo: "Out/25", dev: 5195, den: 2756 },
    { curto: "Nov", longo: "Nov/25", dev: 4352, den: 2539 },
    { curto: "Dez", longo: "Dez/25", dev: 3583, den: 2033 },
    { curto: "Jan", longo: "Jan/26", dev: 5231, den: 2565 },
    { curto: "Fev", longo: "Fev/26", dev: 5290, den: 2658 },
    { curto: "Mar", longo: "Mar/26", dev: 4205, den: 2277 },
    { curto: "Abr", longo: "Abr/26", dev: 3856, den: 1392 },
    { curto: "Mai", longo: "Mai/26", dev: 4097, den: 2592 },
    { curto: "Jun", longo: "Jun/26", dev: 3230, den: 2182 }
  ];

  var nf = new Intl.NumberFormat("pt-BR");
  var nf1 = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  function el(tag, attrs, text) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function chartHeight(width) {
    if (width < 30 * 16) return 250;
    if (width < 46 * 16) return 290;
    if (width < 62 * 16) return 330;
    return 370;
  }

  function labelStride(width) {
    if (width < 26 * 16) return 3;
    if (width < 34 * 16) return 2;
    return 1;
  }

  function monthLabel(mes, width) {
    return width < 46 * 16 ? mes.curto : mes.longo;
  }

  function renderColunas(slot) {
    var width = slot.clientWidth;
    if (!width) return;

    var height = chartHeight(width);
    var m = { top: 26, right: 8, bottom: 38, left: 46 };
    var innerW = width - m.left - m.right;
    var innerH = height - m.top - m.bottom;
    var yMax = 6000;
    var ticks = [0, 2000, 4000, 6000];
    var stride = labelStride(width);
    var band = innerW / MESES.length;
    var barW = Math.max(4, (band * 0.62) / 2);
    var gap = 2;

    var svg = el("svg", {
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-label":
        "Colunas mensais comparando devoluções de inquérito com diligência e denúncias escritas, de julho de 2025 a junho de 2026"
    });

    function y(value) {
      return m.top + innerH - (value / yMax) * innerH;
    }

    ticks.forEach(function (tick) {
      var yy = y(tick);
      svg.appendChild(
        el("line", {
          class: tick === 0 ? "axis-line" : "grid-line",
          x1: m.left,
          x2: m.left + innerW,
          y1: yy,
          y2: yy
        })
      );
      svg.appendChild(
        el(
          "text",
          {
            class: "axis-text",
            x: m.left - 10,
            y: yy + 4,
            "text-anchor": "end"
          },
          tick === 0 ? "0" : nf.format(tick)
        )
      );
    });

    svg.appendChild(
      el(
        "text",
        { class: "axis-text axis-text-strong", x: m.left - 38, y: m.top - 12 },
        "atos por mês"
      )
    );

    MESES.forEach(function (mes, i) {
      var center = m.left + band * i + band / 2;
      var xDev = center - barW - gap / 2;
      var xDen = center + gap / 2;

      svg.appendChild(
        el("rect", {
          class: "bar-dev",
          x: xDev,
          y: y(mes.dev),
          width: barW,
          height: m.top + innerH - y(mes.dev)
        })
      );
      svg.appendChild(
        el("rect", {
          class: "bar-den",
          x: xDen,
          y: y(mes.den),
          width: barW,
          height: m.top + innerH - y(mes.den)
        })
      );

      if (i % stride === 0) {
        svg.appendChild(
          el(
            "text",
            {
              class: "axis-text",
              x: center,
              y: m.top + innerH + 20,
              "text-anchor": "middle"
            },
            monthLabel(mes, width)
          )
        );
      }

      if (mes.dev === 5902) {
        svg.appendChild(
          el(
            "text",
            {
              class: "value-label",
              x: xDev + barW / 2,
              y: y(mes.dev) - 8,
              "text-anchor": "middle"
            },
            nf.format(mes.dev)
          )
        );
      }
    });

    slot.textContent = "";
    slot.appendChild(svg);
  }

  function renderRazao(slot) {
    var width = slot.clientWidth;
    if (!width) return;

    var height = chartHeight(width) - 30;
    var m = { top: 26, right: 12, bottom: 38, left: 46 };
    var innerW = width - m.left - m.right;
    var innerH = height - m.top - m.bottom;
    var yMax = 3;
    var ticks = [0, 1, 2, 3];
    var stride = labelStride(width);
    var step = MESES.length > 1 ? innerW / (MESES.length - 1) : innerW;

    var svg = el("svg", {
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-label":
        "Linha da razão entre devoluções e denúncias por mês, sempre acima de uma vez"
    });

    function y(value) {
      return m.top + innerH - (value / yMax) * innerH;
    }

    function x(i) {
      return m.left + step * i;
    }

    ticks.forEach(function (tick) {
      var yy = y(tick);
      svg.appendChild(
        el("line", {
          class: tick === 0 ? "axis-line" : "grid-line",
          x1: m.left,
          x2: m.left + innerW,
          y1: yy,
          y2: yy
        })
      );
      svg.appendChild(
        el(
          "text",
          { class: "axis-text", x: m.left - 10, y: yy + 4, "text-anchor": "end" },
          tick + "×"
        )
      );
    });

    var pontos = MESES.map(function (mes, i) {
      return { x: x(i), y: y(mes.dev / mes.den), razao: mes.dev / mes.den };
    });

    var areaPath =
      "M" +
      pontos[0].x +
      " " +
      y(1) +
      pontos
        .map(function (p) {
          return "L" + p.x + " " + p.y;
        })
        .join("") +
      "L" +
      pontos[pontos.length - 1].x +
      " " +
      y(1) +
      "Z";

    svg.appendChild(el("path", { class: "ratio-area", d: areaPath }));

    svg.appendChild(
      el("line", {
        class: "ref-line",
        x1: m.left,
        x2: m.left + innerW,
        y1: y(1),
        y2: y(1)
      })
    );
    svg.appendChild(
      el(
        "text",
        { class: "ref-label", x: m.left + 4, y: y(1) + 16 },
        width < 34 * 16
          ? "1× é o empate"
          : "1× seria empate: uma devolução para cada denúncia"
      )
    );

    svg.appendChild(
      el("path", {
        class: "ratio-line",
        d: pontos
          .map(function (p, i) {
            return (i === 0 ? "M" : "L") + p.x + " " + p.y;
          })
          .join("")
      })
    );

    pontos.forEach(function (p, i) {
      svg.appendChild(el("circle", { class: "ratio-dot", cx: p.x, cy: p.y, r: 3.5 }));

      if (i % stride === 0) {
        svg.appendChild(
          el(
            "text",
            {
              class: "axis-text",
              x: p.x,
              y: m.top + innerH + 20,
              "text-anchor": "middle"
            },
            monthLabel(MESES[i], width)
          )
        );
      }
    });

    var pico = pontos.reduce(function (a, b) {
      return b.razao > a.razao ? b : a;
    });
    svg.appendChild(
      el(
        "text",
        {
          class: "value-label",
          x: pico.x,
          y: pico.y - 12,
          "text-anchor": "middle"
        },
        nf1.format(pico.razao) + "×"
      )
    );

    slot.textContent = "";
    slot.appendChild(svg);
  }

  var mensal = document.getElementById("chart-mensal");
  var razao = document.getElementById("chart-razao");

  function desenhar() {
    if (mensal) renderColunas(mensal);
    if (razao) renderRazao(razao);
  }

  desenhar();

  var timer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(desenhar, 150);
  });
})();
