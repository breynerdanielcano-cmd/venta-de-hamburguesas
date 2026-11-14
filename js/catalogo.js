/* ==========================================================
   catalogo.js
   Dibuja en la tienda los productos guardados en la misma base
   de datos que usa el Dashboard. Asi, cuando el administrador
   crea, edita o elimina un producto, la tienda lo refleja.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const contenedorPrincipal = document.querySelector("#productos-principal");
  const contenedorOtros = document.querySelector("#productos-otros");

  if (!contenedorPrincipal) return;

  const productos = listarProductos().filter(function (producto) {
    return producto && producto.nombre;
  });

  function tarjeta(producto) {
    const stock = Number(producto.stock) || 0;
    const agotado = stock <= 0;
    const precio = formatoPrecio(producto.precio);
    const descripcion = producto.descripcion || "Delicioso producto de nuestra tienda.";

    return (
      '<div class="col-md-3 py-3 py-md-0">' +
        '<div class="card" data-id="' + escaparHtml(producto.id) + '"' +
          ' data-nombre="' + escaparHtml(producto.nombre) + '"' +
          ' data-precio="' + Number(producto.precio) + '"' +
          ' data-imagen="' + escaparHtml(producto.imagen || "") + '"' +
          ' data-stock="' + stock + '">' +
          '<div class="catalogo-imagen">' +
            '<img src="' + escaparHtml(producto.imagen || "images/b1.png") + '" alt="' + escaparHtml(producto.nombre) + '">' +
            (agotado ? '<span class="etiqueta-agotado">Agotado</span>' : "") +
          "</div>" +
          '<div class="card-body">' +
            '<span class="catalogo-categoria">' + escaparHtml(producto.categoria || "Producto") + "</span>" +
            "<h3>" + escaparHtml(producto.nombre) + "</h3>" +
            "<p>" + escaparHtml(descripcion) + "</p>" +
            "<h5>" + precio +
              (agotado
                ? ' <span class="sin-stock">Sin stock</span>'
                : ' <span class="btn-product" role="button" title="Agregar al carrito"><i class="fa-solid fa-basket-shopping"></i></span>') +
            "</h5>" +
            '<small class="catalogo-stock">' + (agotado ? "No disponible" : stock + " disponibles") + "</small>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  const principales = productos.slice(0, 8);
  const otros = productos.slice(8);

  contenedorPrincipal.innerHTML = principales.length
    ? principales.map(tarjeta).join("")
    : '<p class="text-center text-muted w-100 py-4">No hay productos disponibles por el momento.</p>';

  if (contenedorOtros) {
    if (otros.length === 0) {
      const seccion = document.querySelector("#otros-productos");
      if (seccion) seccion.classList.add("d-none");
    } else {
      contenedorOtros.innerHTML = otros.map(tarjeta).join("");
    }
  }

  // Si hay una sesion activa, el icono de usuario lleva directo al panel.
  if (sesionActual()) {
    document.querySelectorAll('a[href="dashboard/login.html"]').forEach(function (enlace) {
      enlace.setAttribute("href", "dashboard/index.html");
    });
  }
});
