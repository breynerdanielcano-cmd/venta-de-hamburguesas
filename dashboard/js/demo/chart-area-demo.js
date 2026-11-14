/* ==========================================================
   chart-area-demo.js  (adaptado a Chart.js 3)
   Grafico de ventas mensuales del Dashboard. Usa los pedidos
   reales guardados en localStorage por la tienda y el panel.
   ========================================================== */

(function () {
  "use strict";

  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("myAreaChart");
  if (!canvas) return;

  const MESES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function pedidosGuardados() {
    try {
      const datos = JSON.parse(localStorage.getItem("burger_pedidos"));
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      return [];
    }
  }

  const ahora = new Date();
  const anio = ahora.getFullYear();
  const ventas = new Array(12).fill(0);

  pedidosGuardados().forEach(function (pedido) {
    if (!pedido || pedido.estado === "Cancelado") return;
    const fecha = new Date(pedido.fecha);
    if (isNaN(fecha.getTime()) || fecha.getFullYear() !== anio) return;
    ventas[fecha.getMonth()] += Number(pedido.total) || 0;
  });

  Chart.defaults.font.family =
    "'Nunito', '-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  Chart.defaults.color = "#858796";

  const formatoMoneda = function (valor) {
    return "$" + Math.round(Number(valor) || 0).toLocaleString("es-CO");
  };

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: MESES,
      datasets: [
        {
          label: "Ventas",
          lineTension: 0.3,
          backgroundColor: "rgba(78, 115, 223, 0.05)",
          borderColor: "rgba(78, 115, 223, 1)",
          pointRadius: 3,
          pointBackgroundColor: "rgba(78, 115, 223, 1)",
          pointBorderColor: "rgba(78, 115, 223, 1)",
          pointHoverRadius: 3,
          pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
          pointHoverBorderColor: "rgba(78, 115, 223, 1)",
          pointHitRadius: 10,
          pointBorderWidth: 2,
          data: ventas
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: { left: 10, right: 25, top: 25, bottom: 0 }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { maxTicksLimit: 7 }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgb(234, 236, 244)", drawBorder: false, borderDash: [2], zeroLineBorderDash: [2] },
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function (valor) {
              return formatoMoneda(valor);
            }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgb(255,255,255)",
          bodyColor: "#858796",
          titleMarginBottom: 10,
          titleColor: "#6e707e",
          titleFont: { size: 14 },
          borderColor: "#dddfeb",
          borderWidth: 1,
          padding: 15,
          displayColors: false,
          intersect: false,
          mode: "index",
          caretPadding: 10,
          callbacks: {
            label: function (item) {
              return item.dataset.label + ": " + formatoMoneda(item.parsed.y);
            }
          }
        }
      }
    }
  });
})();
