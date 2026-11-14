/* ==========================================================
   datos.js
   Capa de datos compartida entre la tienda y el Dashboard.
   Todo se guarda en localStorage para que los cambios hechos
   en el Dashboard se reflejen en la tienda y viceversa.

   Modulos: Productos, Clientes, Pedidos y Usuarios.
   Roles: administrador (CRUD completo) y vendedor
   (crear, consultar y editar, sin eliminar).
   ========================================================== */

const BD_CLAVES = {
  productos: "burger_productos",
  clientes: "burger_clientes",
  pedidos: "burger_pedidos",
  usuarios: "burger_usuarios",
  sesion: "burger_sesion",
  version: "burger_bd_version",
  carrito: "burger_carrito"
};

const BD_VERSION = "2.0";

// Imagenes disponibles para los productos (se usan en la tienda
// y en el formulario de productos del Dashboard).
const IMAGENES_PRODUCTOS = [
  { ruta: "images/b1.png", nombre: "Pizza artesanal" },
  { ruta: "images/b2.png", nombre: "Pollo crujiente" },
  { ruta: "images/b3.png", nombre: "Papas fritas" },
  { ruta: "images/b4.png", nombre: "Porcion de pizza" },
  { ruta: "images/b5.png", nombre: "Pizza familiar" },
  { ruta: "images/b6.png", nombre: "Combo de pollo" },
  { ruta: "images/b7.png", nombre: "Papas grandes" },
  { ruta: "images/b8.png", nombre: "Pizza doble" },
  { ruta: "images/p1.png", nombre: "Hamburguesa especial" },
  { ruta: "images/p2.png", nombre: "Hamburguesa BBQ" },
  { ruta: "images/p3.png", nombre: "Alitas picantes" },
  { ruta: "images/p4.png", nombre: "Papas con queso" }
];

const ROLES = {
  administrador: "Administrador",
  vendedor: "Vendedor"
};

const ESTADOS_PEDIDO = ["Pendiente", "En proceso", "En camino", "Entregado", "Cancelado"];

/* --------------------- UTILIDADES --------------------- */

function normalizarTexto(texto) {
  return String(texto == null ? "" : texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escaparHtml(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatoPrecio(valor) {
  return "$" + Math.round(Number(valor) || 0).toLocaleString("es-CO");
}

function formatoFecha(fecha) {
  if (!fecha) return "N/A";
  const valor = new Date(fecha);
  if (isNaN(valor.getTime())) return "N/A";
  return valor.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatoFechaHora(fecha) {
  if (!fecha) return "N/A";
  const valor = new Date(fecha);
  if (isNaN(valor.getTime())) return "N/A";
  return valor.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function generarId(prefijo) {
  return (
    prefijo +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

function generarNumeroPedido() {
  const pedidos = listarPedidos();
  let numero;
  do {
    numero = String(Math.floor(100000 + Math.random() * 900000));
  } while (pedidos.some((pedido) => pedido.numero === numero));
  return numero;
}

// Convierte "images/b1.png" en "../images/b1.png" para el Dashboard,
// que vive dentro de la carpeta dashboard/.
function rutaImagen(imagen) {
  if (!imagen) return "../images/b1.png";
  if (/^(https?:|data:|blob:|\/|\.\.\/)/i.test(imagen)) return imagen;
  return "../" + imagen.replace(/^\.?\//, "");
}

/* ------------------- ALMACENAMIENTO ------------------- */

function leerLista(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
}

function guardarLista(clave, lista) {
  localStorage.setItem(clave, JSON.stringify(lista));
  return lista;
}

function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(BD_CLAVES.sesion));
  } catch (error) {
    return null;
  }
}

/* ---------------------- SEMILLAS ---------------------- */

function fechaHaceDias(dias) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

function semillasProductos() {
  return [
    {
      id: "prod-b1",
      nombre: "Italian Pizza",
      descripcion: "Pizza artesanal con salsa de la casa, queso mozzarella y pepperoni.",
      precio: 6500,
      stock: 24,
      categoria: "Pizza",
      imagen: "images/b1.png",
      creado: fechaHaceDias(20)
    },
    {
      id: "prod-b2",
      nombre: "Fried Chicken",
      descripcion: "Pollo crujiente con nuestra mezcla secreta de especias.",
      precio: 20300,
      stock: 18,
      categoria: "Pollo",
      imagen: "images/b2.png",
      creado: fechaHaceDias(20)
    },
    {
      id: "prod-b3",
      nombre: "Tasty Fries",
      descripcion: "Papas a la francesa doradas y crocantes con sal de mar.",
      precio: 1200,
      stock: 40,
      categoria: "Acompañamientos",
      imagen: "images/b3.png",
      creado: fechaHaceDias(19)
    },
    {
      id: "prod-b4",
      nombre: "Pizza Slice",
      descripcion: "Porcion de pizza recien horneada, ideal para compartir.",
      precio: 3200,
      stock: 30,
      categoria: "Pizza",
      imagen: "images/b4.png",
      creado: fechaHaceDias(19)
    },
    {
      id: "prod-b5",
      nombre: "Italian Pizza Familiar",
      descripcion: "Pizza tamano familiar con doble queso y pepperoni.",
      precio: 24500,
      stock: 12,
      categoria: "Pizza",
      imagen: "images/b5.png",
      creado: fechaHaceDias(18)
    },
    {
      id: "prod-b6",
      nombre: "Fried Chicken Combo",
      descripcion: "Combo de pollo crujiente con papas y bebida.",
      precio: 28900,
      stock: 15,
      categoria: "Pollo",
      imagen: "images/b6.png",
      creado: fechaHaceDias(17)
    },
    {
      id: "prod-b7",
      nombre: "Tasty Fries Grandes",
      descripcion: "Porcion grande de papas a la francesa para compartir.",
      precio: 4500,
      stock: 35,
      categoria: "Acompañamientos",
      imagen: "images/b7.png",
      creado: fechaHaceDias(16)
    },
    {
      id: "prod-b8",
      nombre: "Pizza Slice Doble",
      descripcion: "Doble porcion de pizza con queso extra.",
      precio: 5900,
      stock: 22,
      categoria: "Pizza",
      imagen: "images/b8.png",
      creado: fechaHaceDias(15)
    },
    {
      id: "prod-p1",
      nombre: "Hamburguesa Especial",
      descripcion: "Carne 100% de res, queso cheddar, lechuga y tomate.",
      precio: 18500,
      stock: 20,
      categoria: "Hamburguesas",
      imagen: "images/p1.png",
      creado: fechaHaceDias(14)
    },
    {
      id: "prod-p2",
      nombre: "Hamburguesa BBQ",
      descripcion: "Hamburguesa con salsa BBQ, aros de cebolla y tocineta.",
      precio: 19900,
      stock: 16,
      categoria: "Hamburguesas",
      imagen: "images/p2.png",
      creado: fechaHaceDias(13)
    },
    {
      id: "prod-p3",
      nombre: "Alitas Picantes",
      descripcion: "Alitas de pollo bañadas en salsa picante de la casa.",
      precio: 15900,
      stock: 25,
      categoria: "Pollo",
      imagen: "images/p3.png",
      creado: fechaHaceDias(12)
    },
    {
      id: "prod-p4",
      nombre: "Papas con Queso",
      descripcion: "Papas a la francesa cubiertas con queso fundido.",
      precio: 8900,
      stock: 28,
      categoria: "Acompañamientos",
      imagen: "images/p4.png",
      creado: fechaHaceDias(11)
    }
  ];
}

function semillasClientes() {
  return [
    {
      id: "cli-1",
      nombre: "Daniel",
      apellido: "Cano",
      email: "daniel@example.com",
      celular: "3001234567",
      direccion: "Calle 10 # 20-30",
      direccion2: "Apto 201",
      notas: "Cliente frecuente",
      creado: fechaHaceDias(10)
    },
    {
      id: "cli-2",
      nombre: "Laura",
      apellido: "Gomez",
      email: "laura@example.com",
      celular: "3109876543",
      direccion: "Carrera 45 # 12-08",
      direccion2: "",
      notas: "",
      creado: fechaHaceDias(8)
    },
    {
      id: "cli-3",
      nombre: "Carlos",
      apellido: "Perez",
      email: "carlos@example.com",
      celular: "3205557788",
      direccion: "Transversal 7 # 4-15",
      direccion2: "Casa 3",
      notas: "Entregar en la tarde",
      creado: fechaHaceDias(5)
    }
  ];
}

function semillasPedidos() {
  return [
    {
      id: "ped-1",
      numero: "100245",
      clienteId: "cli-1",
      clienteNombre: "Daniel Cano",
      clienteEmail: "daniel@example.com",
      fecha: fechaHaceDias(3),
      productos: [
        { id: "prod-b1", nombre: "Italian Pizza", precio: 6500, cantidad: 2, imagen: "images/b1.png" },
        { id: "prod-b3", nombre: "Tasty Fries", precio: 1200, cantidad: 1, imagen: "images/b3.png" }
      ],
      subtotal: 14200,
      descuento: 0,
      envio: 10000,
      recargo: 0,
      total: 24200,
      metodoPago: "Efectivo",
      estado: "Entregado",
      notas: "Sin cebolla"
    },
    {
      id: "ped-2",
      numero: "100512",
      clienteId: "cli-2",
      clienteNombre: "Laura Gomez",
      clienteEmail: "laura@example.com",
      fecha: fechaHaceDias(1),
      productos: [
        { id: "prod-p1", nombre: "Hamburguesa Especial", precio: 18500, cantidad: 2, imagen: "images/p1.png" },
        { id: "prod-p4", nombre: "Papas con Queso", precio: 8900, cantidad: 1, imagen: "images/p4.png" }
      ],
      subtotal: 45900,
      descuento: 0,
      envio: 15000,
      recargo: 0,
      total: 60900,
      metodoPago: "PSE",
      estado: "En proceso",
      notas: ""
    },
    {
      id: "ped-3",
      numero: "100874",
      clienteId: "cli-3",
      clienteNombre: "Carlos Perez",
      clienteEmail: "carlos@example.com",
      fecha: fechaHaceDias(0),
      productos: [
        { id: "prod-b2", nombre: "Fried Chicken", precio: 20300, cantidad: 1, imagen: "images/b2.png" },
        { id: "prod-b7", nombre: "Tasty Fries Grandes", precio: 4500, cantidad: 2, imagen: "images/b7.png" }
      ],
      subtotal: 29300,
      descuento: 0,
      envio: 20000,
      recargo: 0,
      total: 49300,
      metodoPago: "Contraentrega",
      estado: "Pendiente",
      notas: "Tocar el timbre"
    }
  ];
}

function semillasUsuarios() {
  return [
    {
      id: "usr-admin",
      usuario: "admin",
      contrasena: "admin123",
      rol: "administrador",
      creado: fechaHaceDias(30)
    },
    {
      id: "usr-vendedor",
      usuario: "vendedor",
      contrasena: "vendedor123",
      rol: "vendedor",
      creado: fechaHaceDias(25)
    }
  ];
}

// Carga los datos iniciales una sola vez. Si ya existen datos
// (por ejemplo compras hechas en la tienda) no los sobrescribe.
function inicializarBD() {
  const yaInicializada = localStorage.getItem(BD_CLAVES.version);

  if (!localStorage.getItem(BD_CLAVES.productos)) {
    guardarLista(BD_CLAVES.productos, semillasProductos());
  }
  if (!localStorage.getItem(BD_CLAVES.clientes)) {
    guardarLista(BD_CLAVES.clientes, semillasClientes());
  }
  if (!localStorage.getItem(BD_CLAVES.pedidos)) {
    guardarLista(BD_CLAVES.pedidos, semillasPedidos());
  }
  if (!localStorage.getItem(BD_CLAVES.usuarios)) {
    guardarLista(BD_CLAVES.usuarios, semillasUsuarios());
  }

  if (yaInicializada !== BD_VERSION) {
    localStorage.setItem(BD_CLAVES.version, BD_VERSION);
  }
}

inicializarBD();

/* --------------------- PRODUCTOS --------------------- */

function listarProductos() {
  return leerLista(BD_CLAVES.productos);
}

function obtenerProducto(id) {
  return listarProductos().find((producto) => producto.id === id) || null;
}

function crearProducto(datos) {
  const productos = listarProductos();
  const producto = {
    id: generarId("prod"),
    nombre: String(datos.nombre || "").trim(),
    descripcion: String(datos.descripcion || "").trim(),
    precio: Math.max(0, Number(datos.precio) || 0),
    stock: Math.max(0, Number(datos.stock) || 0),
    categoria: String(datos.categoria || "Otros").trim(),
    imagen: String(datos.imagen || "images/b1.png").trim(),
    creado: new Date().toISOString()
  };
  productos.push(producto);
  guardarLista(BD_CLAVES.productos, productos);
  return producto;
}

function actualizarProducto(id, datos) {
  const productos = listarProductos();
  const indice = productos.findIndex((producto) => producto.id === id);
  if (indice === -1) return null;

  productos[indice] = {
    ...productos[indice],
    nombre: String(datos.nombre || "").trim(),
    descripcion: String(datos.descripcion || "").trim(),
    precio: Math.max(0, Number(datos.precio) || 0),
    stock: Math.max(0, Number(datos.stock) || 0),
    categoria: String(datos.categoria || "Otros").trim(),
    imagen: String(datos.imagen || productos[indice].imagen).trim()
  };

  guardarLista(BD_CLAVES.productos, productos);
  return productos[indice];
}

function eliminarProducto(id) {
  const productos = listarProductos().filter((producto) => producto.id !== id);
  guardarLista(BD_CLAVES.productos, productos);
  return productos;
}

/* ---------------------- CLIENTES ---------------------- */

function listarClientes() {
  return leerLista(BD_CLAVES.clientes);
}

function obtenerCliente(id) {
  return listarClientes().find((cliente) => cliente.id === id) || null;
}

function crearCliente(datos) {
  const clientes = listarClientes();
  const cliente = {
    id: generarId("cli"),
    nombre: String(datos.nombre || "").trim(),
    apellido: String(datos.apellido || "").trim(),
    email: String(datos.email || "").trim().toLowerCase(),
    celular: String(datos.celular || "").trim(),
    direccion: String(datos.direccion || "").trim(),
    direccion2: String(datos.direccion2 || "").trim(),
    notas: String(datos.notas || "").trim(),
    creado: new Date().toISOString()
  };
  clientes.push(cliente);
  guardarLista(BD_CLAVES.clientes, clientes);
  return cliente;
}

function actualizarCliente(id, datos) {
  const clientes = listarClientes();
  const indice = clientes.findIndex((cliente) => cliente.id === id);
  if (indice === -1) return null;

  clientes[indice] = {
    ...clientes[indice],
    nombre: String(datos.nombre || "").trim(),
    apellido: String(datos.apellido || "").trim(),
    email: String(datos.email || "").trim().toLowerCase(),
    celular: String(datos.celular || "").trim(),
    direccion: String(datos.direccion || "").trim(),
    direccion2: String(datos.direccion2 || "").trim(),
    notas: String(datos.notas || "").trim()
  };

  guardarLista(BD_CLAVES.clientes, clientes);
  return clientes[indice];
}

function eliminarCliente(id) {
  const clientes = listarClientes().filter((cliente) => cliente.id !== id);
  guardarLista(BD_CLAVES.clientes, clientes);
  return clientes;
}

// Se llama desde el checkout de la tienda: crea el cliente o
// actualiza sus datos si ya existe un correo igual.
function registrarClienteDesdeTienda(datosCliente) {
  const datos = {
    nombre: datosCliente.nombres || "",
    apellido: datosCliente.apellidos || "",
    email: datosCliente.email || "",
    celular: datosCliente.celular || "",
    direccion: datosCliente.direccion || "",
    direccion2: datosCliente.direccion2 === "N/A" ? "" : datosCliente.direccion2 || "",
    notas: datosCliente.notas === "N/A" ? "" : datosCliente.notas || ""
  };

  const existente = listarClientes().find(
    (cliente) =>
      normalizarTexto(cliente.email) === normalizarTexto(datos.email) && datos.email
  );

  return existente ? actualizarCliente(existente.id, datos) : crearCliente(datos);
}

/* ----------------------- PEDIDOS ---------------------- */

function listarPedidos() {
  return leerLista(BD_CLAVES.pedidos);
}

function obtenerPedido(id) {
  return listarPedidos().find((pedido) => pedido.id === id) || null;
}

function ajustarStock(items, signo) {
  const productos = listarProductos();

  (items || []).forEach((item) => {
    const producto = productos.find((p) => p.id === item.id);
    if (!producto) return;
    const cantidad = Number(item.cantidad) || 0;
    producto.stock = Math.max(0, (Number(producto.stock) || 0) + signo * cantidad);
  });

  guardarLista(BD_CLAVES.productos, productos);
}

function crearPedido(datos, opciones = {}) {
  const { descontarStock = true } = opciones;
  const pedidos = listarPedidos();

  const pedido = {
    id: generarId("ped"),
    numero: String(datos.numero || generarNumeroPedido()),
    clienteId: datos.clienteId || "",
    clienteNombre: String(datos.clienteNombre || datos.cliente || "").trim(),
    clienteEmail: String(datos.clienteEmail || "").trim(),
    fecha: datos.fecha || new Date().toISOString(),
    productos: Array.isArray(datos.productos) ? datos.productos : [],
    subtotal: Math.max(0, Number(datos.subtotal) || 0),
    descuento: Math.max(0, Number(datos.descuento) || 0),
    envio: Math.max(0, Number(datos.envio) || 0),
    recargo: Math.max(0, Number(datos.recargo) || 0),
    total: Math.max(0, Number(datos.total) || 0),
    metodoPago: String(datos.metodoPago || "Efectivo").trim(),
    estado: ESTADOS_PEDIDO.includes(datos.estado) ? datos.estado : "Pendiente",
    notas: String(datos.notas || "").trim()
  };

  pedidos.unshift(pedido);
  guardarLista(BD_CLAVES.pedidos, pedidos);

  if (descontarStock) ajustarStock(pedido.productos, -1);
  return pedido;
}

function actualizarPedido(id, datos) {
  const pedidos = listarPedidos();
  const indice = pedidos.findIndex((pedido) => pedido.id === id);
  if (indice === -1) return null;

  const anterior = pedidos[indice];
  const productosNuevos = Array.isArray(datos.productos)
    ? datos.productos
    : anterior.productos;

  const actualizado = {
    ...anterior,
    ...datos,
    productos: productosNuevos,
    subtotal: Math.max(0, Number(datos.subtotal != null ? datos.subtotal : anterior.subtotal) || 0),
    descuento: Math.max(0, Number(datos.descuento != null ? datos.descuento : anterior.descuento) || 0),
    envio: Math.max(0, Number(datos.envio != null ? datos.envio : anterior.envio) || 0),
    recargo: Math.max(0, Number(datos.recargo != null ? datos.recargo : anterior.recargo) || 0),
    total: Math.max(0, Number(datos.total != null ? datos.total : anterior.total) || 0),
    estado: ESTADOS_PEDIDO.includes(datos.estado) ? datos.estado : anterior.estado
  };

  // Reajusta el inventario segun la diferencia entre pedidos.
  if (Array.isArray(datos.productos)) {
    ajustarStock(anterior.productos, 1);
    ajustarStock(actualizado.productos, -1);
  }

  pedidos[indice] = actualizado;
  guardarLista(BD_CLAVES.pedidos, pedidos);
  return actualizado;
}

function eliminarPedido(id) {
  const pedido = obtenerPedido(id);
  const pedidos = listarPedidos().filter((item) => item.id !== id);
  guardarLista(BD_CLAVES.pedidos, pedidos);
  if (pedido) ajustarStock(pedido.productos, 1);
  return pedidos;
}

// Se llama desde el checkout: guarda la orden de la tienda en el
// mismo listado de pedidos que usa el Dashboard.
function registrarPedidoDesdeTienda(orden) {
  const pedidos = listarPedidos();
  if (pedidos.some((pedido) => String(pedido.numero) === String(orden.numero))) {
    return null;
  }

  const cliente = registrarClienteDesdeTienda(orden.cliente || {});
  const subtotal = Number(orden.subtotal) || 0;
  const descuento = Number(orden.promo) || 0;
  const envio = Number(orden.domicilio) || 0;
  const recargo = Number(orden.recargo) || 0;

  return crearPedido({
    numero: orden.numero,
    clienteId: cliente ? cliente.id : "",
    clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}`.trim() : "",
    clienteEmail: cliente ? cliente.email : "",
    fecha: orden.fecha || new Date().toISOString(),
    productos: orden.productos || [],
    subtotal,
    descuento,
    envio,
    recargo,
    total: Number(orden.total) || subtotal - descuento + envio + recargo,
    metodoPago: orden.metodoPago || "Efectivo",
    estado: "Pendiente",
    notas: (orden.cliente && orden.cliente.notas) || ""
  });
}

/* ----------------------- USUARIOS --------------------- */

function listarUsuarios() {
  return leerLista(BD_CLAVES.usuarios);
}

function obtenerUsuario(id) {
  return listarUsuarios().find((usuario) => usuario.id === id) || null;
}

function crearUsuario(datos) {
  const usuarios = listarUsuarios();
  const usuario = {
    id: generarId("usr"),
    usuario: String(datos.usuario || "").trim(),
    contrasena: String(datos.contrasena || ""),
    rol: datos.rol === "administrador" ? "administrador" : "vendedor",
    creado: new Date().toISOString()
  };
  usuarios.push(usuario);
  guardarLista(BD_CLAVES.usuarios, usuarios);
  return usuario;
}

function actualizarUsuario(id, datos) {
  const usuarios = listarUsuarios();
  const indice = usuarios.findIndex((usuario) => usuario.id === id);
  if (indice === -1) return null;

  usuarios[indice] = {
    ...usuarios[indice],
    usuario: String(datos.usuario || usuarios[indice].usuario).trim(),
    contrasena: datos.contrasena
      ? String(datos.contrasena)
      : usuarios[indice].contrasena,
    rol: datos.rol === "administrador" ? "administrador" : "vendedor"
  };

  guardarLista(BD_CLAVES.usuarios, usuarios);
  return usuarios[indice];
}

function eliminarUsuario(id) {
  const usuarios = listarUsuarios().filter((usuario) => usuario.id !== id);
  guardarLista(BD_CLAVES.usuarios, usuarios);
  return usuarios;
}

/* ------------------- SESION Y PERMISOS --------------- */

function iniciarSesion(usuario, contrasena) {
  const encontrado = listarUsuarios().find(
    (item) =>
      normalizarTexto(item.usuario) === normalizarTexto(usuario) &&
      item.contrasena === contrasena
  );

  if (!encontrado) {
    return { ok: false, mensaje: "Usuario o contraseña incorrectos." };
  }

  const sesion = {
    id: encontrado.id,
    usuario: encontrado.usuario,
    rol: encontrado.rol,
    inicio: new Date().toISOString()
  };

  localStorage.setItem(BD_CLAVES.sesion, JSON.stringify(sesion));
  return { ok: true, sesion };
}

function sesionActual() {
  const sesion = leerSesion();
  return sesion && sesion.usuario ? sesion : null;
}

function cerrarSesion() {
  localStorage.removeItem(BD_CLAVES.sesion);
}

function esAdministrador() {
  const sesion = sesionActual();
  return Boolean(sesion && normalizarTexto(sesion.rol) === "administrador");
}

function esVendedor() {
  const sesion = sesionActual();
  return Boolean(sesion && normalizarTexto(sesion.rol) === "vendedor");
}

// El vendedor puede crear, consultar y editar, pero no eliminar.
function puedeEliminar() {
  return esAdministrador();
}

function puedeAdministrarUsuarios() {
  return esAdministrador();
}

function exigirSesion() {
  if (!sesionActual()) {
    window.location.replace("login.html");
    return false;
  }
  return true;
}
