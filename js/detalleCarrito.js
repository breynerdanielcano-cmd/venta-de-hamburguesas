/* ==========================================================
   detalleCarrito.js  (Proceso 2: detalle del carrito)
   Se ejecuta en cart.html. Dibuja los productos guardados,
   permite cambiar cantidades, eliminar productos, elegir el
   destino y calcular el resumen de la orden.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const cuerpoTabla = document.querySelector(".cart-table tbody");
  const selectDestino = document.querySelector(".destino");
  const botonPagar = document.querySelector(".btn-resumen");

  if (!cuerpoTabla) return;

  // Recordar el destino elegido anteriormente.
  selectDestino.value = leerDestino();

  dibujarCarrito();

  // Botones + / - y eliminar dentro de la tabla.
  cuerpoTabla.addEventListener("click", (evento) => {
    const accion = evento.target.closest("[data-accion]");
    if (!accion) return;

    const fila = accion.closest("tr");
    const id = fila.dataset.id;

    if (accion.dataset.accion === "sumar") {
      cambiarCantidad(id, 1);
    } else if (accion.dataset.accion === "restar") {
      cambiarCantidad(id, -1);
    } else if (accion.dataset.accion === "eliminar") {
      eliminarDelCarrito(id);
    }

    dibujarCarrito();
  });

  // Al cambiar la ciudad se recalcula el domicilio y el total.
  selectDestino.addEventListener("change", () => {
    guardarDestino(selectDestino.value);
    actualizarResumen(leerCarrito());
  });

  // Ir al proceso de pago.
  botonPagar.addEventListener("click", () => {
    if (leerCarrito().length === 0) {
      mostrarMensaje("Tu carrito esta vacio, agrega un producto primero.");
      return;
    }

    guardarDestino(selectDestino.value);
    window.location.href = "checkout.html";
  });

  /* --------------------- funciones propias --------------------- */

  function dibujarCarrito() {
    const carrito = leerCarrito();

    if (carrito.length === 0) {
      cuerpoTabla.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5">
            <p class="mb-3">Tu carrito esta vacio.</p>
            <a href="index.html#burger" class="cus-btn primary">
              <span class="icon-wrapper">
                <i class="fa-solid fa-burger"></i>
              </span>
              Ver productos
            </a>
          </td>
        </tr>`;
    } else {
      cuerpoTabla.innerHTML = carrito
        .map(
          (producto) => `
          <tr data-id="${producto.id}">
            <td class="product-block">
              <button type="button" class="remove-from-cart-btn border-0" data-accion="eliminar" title="Eliminar">
                <i class="fa-solid fa-xmark"></i>
              </button>
              <img src="${producto.imagen}" alt="${producto.nombre}">
              <div>
                <h6 class="mb-0">${producto.nombre}</h6>
                <p class="mb-0 text-muted small">${dinero(producto.precio)} c/u</p>
              </div>
            </td>
            <td>${dinero(producto.precio)}</td>
            <td>
              <div class="quantity">
                <span class="decrement" data-accion="restar" title="Quitar uno">
                  <i class="fa-solid fa-minus"></i>
                </span>
                <input type="text" value="${producto.cantidad}" readonly>
                <span class="increment" data-accion="sumar" title="Agregar uno">
                  <i class="fa-solid fa-plus"></i>
                </span>
              </div>
            </td>
            <td class="fw-bold">${dinero(producto.precio * producto.cantidad)}</td>
          </tr>`
        )
        .join("");
    }

    actualizarResumen(carrito);
  }

  function actualizarResumen(carrito) {
    const subtotal = subtotalCarrito(carrito);
    const hayProductos = carrito.length > 0;
    const destino = selectDestino.value;
    // Si el carrito esta vacio no se cobra domicilio ni descuento.
    const domicilio = hayProductos ? valorDomicilio(destino) : 0;
    const promo = hayProductos ? descuentoPromo(subtotal) : 0;
    const total = subtotal + domicilio - promo;

    document.querySelector(".res-sub-total").textContent = dinero(subtotal);
    document.querySelector(".valor-domi").textContent = dinero(domicilio);
    document.querySelector(".promo").textContent = "-" + dinero(promo);
    document.querySelector(".total").textContent = dinero(total);

    // El boton de pago solo esta activo si hay productos.
    botonPagar.disabled = carrito.length === 0;
    botonPagar.classList.toggle("deshabilitado", carrito.length === 0);
  }
});
