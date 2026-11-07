/* ==========================================================
   carrito.js  (Proceso 1: carrito)
   Se ejecuta en index.html. Cada vez que se hace clic en el
   icono de la canasta agrega el producto al carrito, actualiza
   el contador y dibuja el mini listado del navbar.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const botonesProductos = document.querySelectorAll(".btn-product");
  const iconoCarrito = document.querySelector(".carrito");
  const listaCarrito = document.querySelector(".list-cart");

  // 1. Escuchar el clic de todos los botones de producto.
  botonesProductos.forEach((boton) => {
    boton.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();

      const tarjeta = boton.closest(".card");
      const nombre = tarjeta.querySelector("h3").textContent.trim();
      const precio = Number(
        tarjeta.querySelector("h5").textContent.replace(/[^\d]/g, "")
      );
      const imagen = tarjeta.querySelector("img").getAttribute("src");

      agregarAlCarrito({
        id: crearId(nombre),
        nombre,
        precio,
        imagen
      });

      dibujarListaCarrito();
      mostrarMensaje(`${nombre} agregado al carrito`);
    });
  });

  // 2. Mostrar u ocultar el mini carrito del navbar.
  if (iconoCarrito && listaCarrito) {
    iconoCarrito.addEventListener("click", (evento) => {
      evento.stopPropagation();
      listaCarrito.classList.toggle("ocultar");
    });

    document.addEventListener("click", (evento) => {
      if (!listaCarrito.contains(evento.target)) {
        listaCarrito.classList.add("ocultar");
      }
    });
  }

  // 3. Dibujar el estado guardado al cargar la pagina.
  dibujarListaCarrito();
  actualizarContador();

  /* --------------------- funciones propias --------------------- */

  function dibujarListaCarrito() {
    const cuerpo = document.querySelector(".cart-dropdown-body");
    const etiquetaTotal = document.querySelector(".cart-dropdown-total");
    const carrito = leerCarrito();

    if (!cuerpo) return;

    if (carrito.length === 0) {
      cuerpo.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4 text-muted">
            Tu carrito esta vacio
          </td>
        </tr>`;
    } else {
      cuerpo.innerHTML = carrito
        .map(
          (producto, indice) => `
          <tr>
            <td>${indice + 1}</td>
            <td><img src="${producto.imagen}" alt="${producto.nombre}" class="img-carrito-mini"></td>
            <td>
              ${producto.nombre}
              <span class="badge-cantidad">x${producto.cantidad}</span>
            </td>
            <td>${dinero(producto.precio * producto.cantidad)}</td>
          </tr>`
        )
        .join("");
    }

    if (etiquetaTotal) {
      etiquetaTotal.textContent = dinero(subtotalCarrito(carrito));
    }
  }
});
