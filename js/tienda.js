/* ==========================================================
   tienda.js
   Utilidades compartidas por el carrito, el detalle y el pago.
   El carrito se guarda en localStorage para que los datos
   pasen de una pagina a otra.
   ========================================================== */

const CLAVE_CARRITO = "burger_carrito";
const CLAVE_DESTINO = "burger_destino";
const CLAVE_ORDEN = "burger_orden";

// Valor del domicilio segun la ciudad de entrega.
const DESTINOS = {
  Medellin: 0,
  Bello: 10000,
  Itagui: 15000,
  Envigado: 15000,
  Sabaneta: 15000,
  "La Estrella": 20000,
  Caldas: 20000,
  Copacabana: 20000
};

// Metodos de pago y porcentaje que se suma al total.
const METODOS_PAGO = {
  contraentrega: { nombre: "Contraentrega", recargo: 0.05 },
  pse: { nombre: "PSE", recargo: 0.03 },
  transferencia: { nombre: "Transferencia", recargo: 0 }
};

// Da formato de pesos colombianos: 119091 -> $119.091
function dinero(valor) {
  return "$" + Math.round(Number(valor) || 0).toLocaleString("es-CO");
}

// Convierte "Italian Pizza" en "italian-pizza" (id unico por producto).
function crearId(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ----------------------- CARRITO ----------------------- */

function leerCarrito() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  actualizarContador();
}

function agregarAlCarrito(producto) {
  const carrito = leerCarrito();
  const existente = carrito.find((item) => item.id === producto.id);

  if (existente) {
    existente.cantidad += 1;
    existente.precio = producto.precio;
    existente.imagen = producto.imagen;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  guardarCarrito(carrito);
  return carrito;
}

function cambiarCantidad(id, cambio) {
  const carrito = leerCarrito();
  const producto = carrito.find((item) => item.id === id);
  if (!producto) return carrito;

  producto.cantidad += cambio;
  if (producto.cantidad <= 0) {
    return eliminarDelCarrito(id);
  }

  guardarCarrito(carrito);
  return carrito;
}

function eliminarDelCarrito(id) {
  const carrito = leerCarrito().filter((item) => item.id !== id);
  guardarCarrito(carrito);
  return carrito;
}

function vaciarCarrito() {
  localStorage.removeItem(CLAVE_CARRITO);
  actualizarContador();
}

// Cantidad total de unidades (para el globo del icono del carrito).
function cantidadTotal(carrito = leerCarrito()) {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

// Suma de precio x cantidad de todos los productos.
function subtotalCarrito(carrito = leerCarrito()) {
  return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

// Descuento promocional: 10% cuando la compra supera $100.000.
function descuentoPromo(subtotal) {
  return subtotal >= 100000 ? Math.round(subtotal * 0.1) : 0;
}

function actualizarContador() {
  const total = cantidadTotal();
  document.querySelectorAll(".contar-pro").forEach((badge) => {
    badge.textContent = total;
    badge.style.display = total > 0 ? "inline-block" : "none";
  });
}

/* --------------------- DESTINO / PAGO --------------------- */

function guardarDestino(nombre) {
  localStorage.setItem(CLAVE_DESTINO, nombre);
}

function leerDestino() {
  const nombre = localStorage.getItem(CLAVE_DESTINO);
  return nombre && DESTINOS.hasOwnProperty(nombre) ? nombre : "Medellin";
}

function valorDomicilio(nombre) {
  return DESTINOS.hasOwnProperty(nombre) ? DESTINOS[nombre] : 0;
}

/* ----------------------- AVISOS ----------------------- */

// Aviso flotante reutilizable en todas las paginas.
function mostrarMensaje(texto) {
  let aviso = document.querySelector(".aviso-carrito");

  if (!aviso) {
    aviso = document.createElement("div");
    aviso.className = "aviso-carrito";
    document.body.appendChild(aviso);
  }

  aviso.textContent = texto;
  aviso.classList.add("visible");

  clearTimeout(mostrarMensaje.tiempo);
  mostrarMensaje.tiempo = setTimeout(() => {
    aviso.classList.remove("visible");
  }, 2000);
}

/* ------------------------ ORDEN ------------------------ */
// Se usa en checkout.js (guarda) y thankyou.js (lee).

function guardarOrden(orden) {
  localStorage.setItem(CLAVE_ORDEN, JSON.stringify(orden));
}

function leerOrden() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ORDEN));
  } catch (error) {
    return null;
  }
}

// Mantiene el globo del carrito actualizado en todas las paginas.
document.addEventListener("DOMContentLoaded", actualizarContador);
