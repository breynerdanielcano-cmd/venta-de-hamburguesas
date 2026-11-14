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
      const nombre = tarjeta.dataset.nombre || tarjeta.querySelector("h3").textContent.trim();
      const precio = tarjeta.dataset.precio
        ? Number(tarjeta.dataset.precio)
        : Number(tarjeta.querySelector("h5").textContent.replace(/[^\d]/g, ""));
      const imagen = tarjeta.dataset.imagen || tarjeta.querySelector("img").getAttribute("src");
      const id = tarjeta.dataset.id || crearId(nombre);
      const stock = tarjeta.dataset.stock !== undefined ? Number(tarjeta.dataset.stock) : null;

      // No permitir superar el stock disponible del producto.
      const enCarrito = leerCarrito()
        .filter((item) => item.id === id)
        .reduce((total, item) => total + item.cantidad, 0);

      if (stock !== null && stock <= 0) {
        mostrarMensaje(`${nombre} esta agotado por el momento`);
        return;
      }

      if (stock !== null && enCarrito >= stock) {
        mostrarMensaje(`Solo hay ${stock} unidades de ${nombre}`);
        return;
      }

      agregarAlCarrito({ id, nombre, precio, imagen });

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

  // 3. Eliminar un producto con la X del mini carrito.
  const cuerpoCarrito = document.querySelector(".cart-dropdown-body");

  if (cuerpoCarrito) {
    cuerpoCarrito.addEventListener("click", (evento) => {
      const boton = evento.target.closest(".btn-eliminar-mini");
      if (!boton) return;

      evento.preventDefault();
      evento.stopPropagation();

      const carrito = eliminarDelCarrito(boton.dataset.id);
      dibujarListaCarrito();
      mostrarMensaje(
        carrito.length > 0
          ? "Producto eliminado del carrito"
          : "Carrito vacio"
      );
    });
  }

  // 4. Dibujar el estado guardado al cargar la pagina.
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
          <td colspan="5" class="text-center py-4 text-muted">
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
            <td>
              <button type="button" class="btn-eliminar-mini" data-id="${producto.id}" title="Eliminar del carrito">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </td>
          </tr>`
        )
        .join("");
    }

    if (etiquetaTotal) {
      etiquetaTotal.textContent = dinero(subtotalCarrito(carrito));
    }
  }
});
