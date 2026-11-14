/* ==========================================================
   chart-pie-demo.js  (adaptado a Chart.js 3)
   Distribucion de pedidos por estado en el Dashboard.
   ========================================================== */

(function () {
  "use strict";

  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("myPieChart");
  if (!canvas) return;

  function pedidosGuardados() {
    try {
      const datos = JSON.parse(localStorage.getItem("burger_pedidos"));
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      return [];
    }
  }

  const pedidos = pedidosGuardados();
  const resumen = { Entregados: 0, "En proceso": 0, Cancelados: 0 };

  pedidos.forEach(function (pedido) {
    const estado = String((pedido && pedido.estado) || "");
    if (estado === "Entregado") resumen.Entregados += 1;
    else if (estado === "Cancelado") resumen.Cancelados += 1;
    else resumen["En proceso"] += 1;
  });

  if (!pedidos.length) {
    resumen.Entregados = 0;
    resumen["En proceso"] = 0;
    resumen.Cancelados = 0;
  }

  Chart.defaults.font.family =
    "'Nunito', '-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  Chart.defaults.color = "#858796";

  new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Entregados", "En proceso", "Cancelados"],
      datasets: [
        {
          data: [resumen.Entregados, resumen["En proceso"], resumen.Cancelados],
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
          hoverBackgroundColor: ["#2e59d9", "#17a673", "#2c9faf"],
          hoverBorderColor: "rgba(234, 236, 244, 1)"
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      cutout: "80%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgb(255,255,255)",
          bodyColor: "#858796",
          borderColor: "#dddfeb",
          borderWidth: 1,
          padding: 15,
          displayColors: false,
          caretPadding: 10
        }
      }
    }
  });

  // Actualiza el texto de la leyenda que acompana al grafico.
  const leyenda = document.querySelector(".chart-pie + .mt-4");
  if (leyenda) {
    const etiquetas = ["Entregados", "En proceso", "Cancelados"];
    leyenda.querySelectorAll("span").forEach(function (span, indice) {
      if (!etiquetas[indice]) return;
      const icono = span.querySelector("i");
      span.textContent = "";
      if (icono) span.appendChild(icono);
      span.appendChild(document.createTextNode(" " + etiquetas[indice]));
    });
  }
})();
