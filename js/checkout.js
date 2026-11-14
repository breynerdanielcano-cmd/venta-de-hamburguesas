/* ==========================================================
   checkout.js  (Proceso 3: pagar)
   Se ejecuta en checkout.html. Muestra el resumen de la orden,
   permite sumar o restar productos, calcula el domicilio, la
   promoción y el recargo según el método de pago.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const contenedorProductos = document.querySelector(".productos");
  const botonPagar = document.querySelector(".btn-checkout");
  const formulario = document.querySelector("#form-checkout");
  const radiosPago = document.querySelectorAll('input[name="radio"]');
  const campoDestino = document.querySelector(".destino");

  // Valor del radio -> llave de METODOS_PAGO (definido en tienda.js).
  const METODO_POR_RADIO = {
    "1": "contraentrega",
    "2": "pse",
    "3": "transferencia"
  };

  if (!contenedorProductos) return;

  dibujarResumen();

  // Sumar o restar cantidades directamente en el resumen del pago.
  contenedorProductos.addEventListener("click", (evento) => {
    const control = evento.target.closest("[data-accion]");
    if (!control) return;

    const fila = control.closest("[data-id]");
    if (!fila) return;

    const id = fila.dataset.id;
    const accion = control.dataset.accion;

    if (accion === "sumar") {
      cambiarCantidad(id, 1);
    } else if (accion === "restar") {
      cambiarCantidad(id, -1);
    }

    dibujarResumen();
  });

  // Al cambiar el método de pago cambia el recargo y el total.
  radiosPago.forEach((radio) => {
    radio.addEventListener("change", dibujarResumen);
  });

  // Finalizar la compra.
  if (botonPagar) {
    botonPagar.addEventListener("click", () => {
      const carrito = leerCarrito();

      if (carrito.length === 0) {
        mostrarMensaje("Tu carrito está vacío. Agrega productos antes de pagar.");
        return;
      }

      // Verifica el stock actual (puede cambiar desde el Dashboard).
      const catalogo = listarProductos();
      const sinStock = carrito.find((item) => {
        const producto = catalogo.find((p) => p.id === item.id);
        return producto && item.cantidad > (Number(producto.stock) || 0);
      });

      if (sinStock) {
        const producto = catalogo.find((p) => p.id === sinStock.id);
        mostrarMensaje(
          `Solo quedan ${producto.stock} unidades de ${sinStock.nombre}. Ajusta tu carrito.`
        );
        return;
      }

      if (formulario && !formulario.checkValidity()) {
        formulario.reportValidity();
        return;
      }

      const resumen = calcularResumen(carrito);
      const metodo = obtenerMetodoPago();

      const orden = {
        numero: String(Math.floor(100000 + Math.random() * 900000)),
        fecha: new Date().toISOString(),
        estado: "Pedido en proceso",
        cliente: {
          nombres: document.querySelector("#nombres-input").value.trim(),
          apellidos: document.querySelector("#apellidos-input").value.trim(),
          email: document.querySelector("#email-input").value.trim(),
          celular: document.querySelector("#celular-input").value.trim(),
          direccion: document.querySelector("#direccion-input").value.trim(),
          direccion2:
            document.querySelector("#direccion-2-input").value.trim() || "N/A",
          notas:
            document.querySelector("#additiona-note").value.trim() || "N/A"
        },
        productos: carrito.map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad,
          imagen: producto.imagen,
          total: producto.precio * producto.cantidad
        })),
        destino: resumen.destino,
        domicilio: resumen.domicilio,
        subtotal: resumen.subtotal,
        promo: resumen.promo,
        recargo: resumen.recargo,
        metodoPago: metodo.nombre,
        metodoClave: metodo.clave,
        total: resumen.total
      };

      guardarOrden(orden);
      // Guarda el pedido en la base compartida con el Dashboard.
      registrarPedidoDesdeTienda(orden);
      vaciarCarrito();
      window.location.href = "thankyou.html";
    });
  }

  /* --------------------- funciones propias --------------------- */

  function calcularResumen(carrito) {
    if (carrito.length === 0) {
      return {
        subtotal: 0,
        base: 0,
        destino: leerDestino(),
        domicilio: 0,
        promo: 0,
        recargo: 0,
        total: 0
      };
    }

    const subtotal = subtotalCarrito(carrito);
    const destino = leerDestino();
    const domicilio = valorDomicilio(destino);
    const promo = descuentoPromo(subtotal);
    const base = subtotal - promo + domicilio;
    const metodo = obtenerMetodoPago();
    const recargo = Math.round(base * metodo.recargo);
    const total = base + recargo;

    return { subtotal, base, destino, domicilio, promo, recargo, total };
  }

  function obtenerMetodoPago() {
    const seleccionado = document.querySelector('input[name="radio"]:checked');
    const clave = METODO_POR_RADIO[seleccionado ? seleccionado.value : "1"];
    const metodo = METODOS_PAGO[clave];

    return {
      clave: clave,
      nombre: metodo.nombre,
      recargo: metodo.recargo
    };
  }

  function dibujarResumen() {
    const carrito = leerCarrito();
    const resumen = calcularResumen(carrito);

    // Productos con sus cantidades y controles.
    if (carrito.length === 0) {
      contenedorProductos.innerHTML = `
        <p class="text-center text-muted py-3 mb-0">
          No hay productos en el carrito.
          <a href="index.html#burger">Agregar productos</a>
        </p>`;
    } else {
      contenedorProductos.innerHTML = carrito
        .map(
          (producto) => `
          <div class="checkout-item" data-id="${producto.id}">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="checkout-item-datos">
              <p class="mb-0">${producto.nombre}</p>
              <small class="text-muted">${dinero(producto.precio)} c/u</small>
            </div>
            <div class="checkout-cantidad">
              <button type="button" data-accion="restar" title="Quitar uno">−</button>
              <span>${producto.cantidad}</span>
              <button type="button" data-accion="sumar" title="Agregar uno">+</button>
            </div>
            <strong class="checkout-item-total">${dinero(
              producto.precio * producto.cantidad
            )}</strong>
          </div>`
        )
        .join("");
    }

    // Resumen de valores.
    document.querySelector(".valor-domi").textContent = dinero(resumen.domicilio);
    document.querySelector(".res-sub-total").textContent = dinero(resumen.base);
    document.querySelector(".promo").textContent = "-" + dinero(resumen.promo);

    const campoRecargo = document.querySelector(".recargo");
    if (campoRecargo) campoRecargo.textContent = "+" + dinero(resumen.recargo);

    if (campoDestino) campoDestino.textContent = resumen.destino;

    document.querySelector(".total").textContent = dinero(resumen.total);

    if (botonPagar) {
      botonPagar.disabled = carrito.length === 0;
      botonPagar.classList.toggle("deshabilitado", carrito.length === 0);
    }
  }
});
