/* ==========================================================
   thankyou.js  (Proceso 3: confirmación del pago)
   Se ejecuta en thankyou.html. Lee la orden guardada en
   localStorage y muestra el resumen final de la compra.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const orden = leerOrden();
  const botonOtraCompra = document.querySelector(".btn-gracias");

  if (botonOtraCompra) {
    botonOtraCompra.addEventListener("click", () => {
      vaciarCarrito();
      localStorage.removeItem(CLAVE_ORDEN);
      window.location.href = "index.html#burger";
    });
  }

  if (!orden) {
    const contenedor = document.querySelector(".resumen-compra");
    if (contenedor) {
      contenedor.innerHTML = `
        <h5 class="mb-16">No hay una orden reciente</h5>
        <p class="mb-32">Realiza una compra para ver aquí el resumen de tu pedido.</p>
        <a href="index.html#burger" class="cus-btn dark">
          <span class="icon-wrapper"><i class="fa-solid fa-burger"></i></span>
          Ir a comprar
        </a>`;
    }
    return;
  }

  const cliente = orden.cliente || {};
  const producto = orden.productos || [];
  const nombreCompleto = [cliente.nombres, cliente.apellidos]
    .filter(Boolean)
    .join(" ");

  // Encabezado.
  document.querySelector("#cliente-nombre").textContent =
    (cliente.nombres || "Cliente") + "!";
  document.querySelector("#orden-numero").textContent = "#" + orden.numero;

  // Datos de envío.
  document.querySelector("#envio-nombre").textContent = nombreCompleto || "N/A";
  document.querySelector("#envio-celular").textContent = cliente.celular || "N/A";
  document.querySelector("#envio-direccion").textContent =
    cliente.direccion || "N/A";
  document.querySelector("#envio-direccion2").textContent =
    cliente.direccion2 || "N/A";
  document.querySelector("#envio-nota").textContent = cliente.notas || "N/A";

  // Productos comprados.
  const contenedorProductos = document.querySelector("#productos-comprados");
  contenedorProductos.innerHTML = producto
    .map(
      (item) => `
      <p class="mb-1">
        ${item.nombre} - Cantidad: ${item.cantidad} - Precio: ${dinero(
        item.precio
      )}
      </p>`
    )
    .join("");

  // Totales y pago.
  document.querySelector("#resumen-ciudad").textContent = orden.destino || "N/A";
  document.querySelector("#resumen-domicilio").textContent = dinero(
    orden.domicilio || 0
  );
  document.querySelector("#resumen-promo").textContent =
    "-" + dinero(orden.promo || 0);
  document.querySelector("#resumen-metodo").textContent =
    orden.metodoPago || "N/A";
  document.querySelector("#total-pagar").textContent = dinero(orden.total || 0);
});
