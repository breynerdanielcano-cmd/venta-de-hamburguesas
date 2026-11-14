/* ==========================================================
   crud.js
   CRUD del Dashboard (Productos, Clientes, Pedidos y Usuarios)
   sobre el diseno SB Admin 2 del profesor.

   - Listados: busqueda en vivo y acciones por fila.
   - Formularios: crean o actualizan (crear-*.html?id=ID).
   - Roles: el vendedor puede crear, consultar y editar;
     solo el administrador puede eliminar.
   ========================================================== */

(function () {
  "use strict";

  const PAGINA = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const ID_EDICION = new URLSearchParams(window.location.search).get("id");

  function qs(selector, contexto) {
    return (contexto || document).querySelector(selector);
  }

  function qsa(selector, contexto) {
    return Array.prototype.slice.call((contexto || document).querySelectorAll(selector));
  }

  function aviso(tipo, texto) {
    if (typeof window.dashboardAlerta === "function") {
      window.dashboardAlerta(tipo, texto);
    }
  }

  function flash(tipo, texto) {
    sessionStorage.setItem("burger_flash", JSON.stringify({ tipo: tipo, texto: texto }));
  }

  function cuerpoTabla() {
    return qs(".container-fluid table tbody");
  }

  function buscador() {
    return qs('.container-fluid input[type="search"]');
  }

  function botonesAccion(id, paginaEdicion, verDetalle) {
    let html = "";

    if (verDetalle) {
      html +=
        '<button type="button" class="btn btn-primary btn-sm" data-ver="' + escaparHtml(id) + '" title="Ver detalle">' +
        '<i class="fas fa-eye"></i></button> ';
    }

    html +=
      '<a href="' + paginaEdicion + '?id=' + encodeURIComponent(id) + '" class="btn btn-info btn-sm" title="Editar">' +
      '<i class="fas fa-pen"></i></a>';

    if (puedeEliminar()) {
      html +=
        ' <button type="button" class="btn btn-danger btn-sm" data-eliminar="' + escaparHtml(id) + '" title="Eliminar">' +
        '<i class="fas fa-trash"></i></button>';
    }

    return '<td class="text-nowrap">' + html + "</td>";
  }

  function confirmarEliminacion(descripcion) {
    return window.confirm("¿Seguro que deseas eliminar " + descripcion + "?");
  }

  /* ---------------------- PRODUCTOS --------------------- */

  const CATALOGO_PRODUCTOS = [
    { nombre: "Hamburguesa", precio: 30000, imagen: "images/p1.png" },
    { nombre: "Picada", precio: 65000, imagen: "images/b6.png" },
    { nombre: "Pasta", precio: 25000, imagen: "images/b4.png" },
    { nombre: "Perro", precio: 22000, imagen: "images/b7.png" },
    { nombre: "Sanchipapa", precio: 20000, imagen: "images/b3.png" },
    { nombre: "Chuzo", precio: 22000, imagen: "images/p4.png" },
    { nombre: "Pizza", precio: 45000, imagen: "images/b1.png" },
    { nombre: "Pollo", precio: 35000, imagen: "images/b2.png" },
    { nombre: "Tacos", precio: 26000, imagen: "images/b5.png" },
    { nombre: "Burrito", precio: 25000, imagen: "images/p2.png" }
  ];

  function listadoProductos() {
    const tbody = cuerpoTabla();
    if (!tbody) return;

    const pintar = function () {
      const filtro = normalizarTexto(buscador() ? buscador().value : "");
      const productos = listarProductos().filter(function (producto) {
        if (!filtro) return true;
        return normalizarTexto(
          producto.nombre + " " + producto.categoria + " " + producto.descripcion
        ).indexOf(filtro) !== -1;
      });

      if (!productos.length) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center text-muted py-4">No hay productos para mostrar.</td></tr>';
        return;
      }

      tbody.innerHTML = productos
        .map(function (producto, indice) {
          const stock = Number(producto.stock) || 0;
          const claseStock = stock === 0 ? "badge-danger" : stock <= 5 ? "badge-warning" : "badge-success";

          return (
            "<tr>" +
            "<td>" + (indice + 1) + "</td>" +
            '<td class="font-weight-bold">' + escaparHtml(producto.nombre) + "</td>" +
            '<td class="text-muted small">' + escaparHtml(producto.descripcion || "Sin descripción") + "</td>" +
            "<td>" + formatoPrecio(producto.precio) + "</td>" +
            '<td><span class="badge ' + claseStock + '">' + stock + "</span></td>" +
            '<td><img src="' + rutaImagen(producto.imagen) + '" alt="" class="rounded" ' +
            'style="width:44px;height:44px;object-fit:cover"></td>' +
            botonesAccion(producto.id, "crear-pro.html", false) +
            "</tr>"
          );
        })
        .join("");
    };

    if (buscador()) buscador().addEventListener("input", pintar);

    tbody.addEventListener("click", function (evento) {
      const boton = evento.target.closest("[data-eliminar]");
      if (!boton) return;

      const producto = obtenerProducto(boton.getAttribute("data-eliminar"));
      if (!producto) return;
      if (!confirmarEliminacion('el producto "' + producto.nombre + '"')) return;

      eliminarProducto(producto.id);
      pintar();
      aviso("success", "Producto eliminado correctamente.");
    });

    pintar();
  }

  function formularioProducto() {
    const formulario = qs(".container-fluid form");
    if (!formulario) return;

    const nombre = qs("#nombre-pro");
    const imagenUrl = qs("#imagen-url");
    const precio = qs("#precio-pro");
    const stock = qs("#form6Example6");
    const descripcion = qs("#form6Example7");
    const imagen = qs("#imagen-pro");
    const boton = qs("button", formulario);
    const producto = ID_EDICION ? obtenerProducto(ID_EDICION) : null;

    if (!nombre || !precio || !stock || !descripcion || !boton) return;

    const IMAGEN_DEFECTO = "images/b1.png";

    // Normaliza lo que escribe el usuario: acepta URL de Google, ruta del
    // proyecto ("images/foto.png"), "../images/foto.png" o "/images/foto.png".
    function limpiarImagen(valor) {
      let texto = String(valor == null ? "" : valor).trim();
      if (!texto) return "";
      texto = texto.replace(/^\.\.\//, "").replace(/^\.\//, "");
      if (texto.charAt(0) === "/" && !/^\/\//.test(texto)) texto = texto.slice(1);
      return texto;
    }

    function esImagenValida(valor) {
      return /^(https?:\/\/|data:image\/|blob:)/i.test(valor) || /^images\/[\w.\-/%]+$/i.test(valor);
    }

    // Muestra la imagen en la vista previa y, si falla, deja un aviso.
    function previsualizar(valor) {
      if (!imagen) return;
      const limpia = limpiarImagen(valor);
      imagen.onerror = function () {
        imagen.onerror = null;
        imagen.src = rutaImagen(IMAGEN_DEFECTO);
      };
      const destino = limpia && esImagenValida(limpia) ? limpia : IMAGEN_DEFECTO;
      imagen.src = rutaImagen(destino);
    }

    function buscarEnCatalogo(valor) {
      const texto = normalizarTexto(valor);
      if (!texto) return null;
      return (
        CATALOGO_PRODUCTOS.find(function (item) {
          return normalizarTexto(item.nombre) === texto;
        }) || null
      );
    }

    function aplicarCatalogo() {
      const tipo = buscarEnCatalogo(nombre.value);
      if (!tipo) return;
      // Solo rellena los campos vacios para no borrar lo que el usuario escribio.
      if (!String(precio.value).trim()) precio.value = tipo.precio;
      if (!limpiarImagen(imagenUrl ? imagenUrl.value : "")) {
        if (imagenUrl) imagenUrl.value = tipo.imagen;
        previsualizar(tipo.imagen);
      }
    }

    nombre.addEventListener("input", aplicarCatalogo);
    nombre.addEventListener("change", aplicarCatalogo);

    if (imagenUrl) {
      imagenUrl.addEventListener("input", function () {
        previsualizar(imagenUrl.value);
      });
      imagenUrl.addEventListener("change", function () {
        previsualizar(imagenUrl.value);
      });
    }

    if (producto) {
      nombre.value = producto.nombre;
      precio.value = producto.precio;
      stock.value = producto.stock;
      descripcion.value = producto.descripcion || "";
      if (imagenUrl) imagenUrl.value = producto.imagen || "";
      previsualizar(producto.imagen);
      boton.textContent = "Actualizar Producto";
    } else {
      previsualizar("");
    }

    function guardar(evento) {
      if (evento) evento.preventDefault();

      const nombreProducto = String(nombre.value || "").trim();
      if (!nombreProducto) {
        aviso("danger", "Escribe el nombre del producto que deseas guardar.");
        nombre.focus();
        return;
      }

      if (nombreProducto.length < 2) {
        aviso("danger", "El nombre del producto es demasiado corto.");
        nombre.focus();
        return;
      }

      if (String(precio.value).trim() === "" || Number(precio.value) <= 0) {
        aviso("danger", "El precio debe ser mayor que cero.");
        precio.focus();
        return;
      }

      if (String(stock.value).trim() === "" || Number(stock.value) < 0) {
        aviso("danger", "Ingresa un stock válido.");
        stock.focus();
        return;
      }

      const imagenEscrita = imagenUrl ? limpiarImagen(imagenUrl.value) : "";

      if (imagenEscrita && !esImagenValida(imagenEscrita)) {
        aviso(
          "danger",
          "La direccion de la imagen no es valida. Debe empezar con https:// (copiar direccion de imagen en Google)."
        );
        if (imagenUrl) imagenUrl.focus();
        return;
      }

      const repetido = listarProductos().some(function (item) {
        return (
          normalizarTexto(item.nombre) === normalizarTexto(nombreProducto) &&
          (!producto || item.id !== producto.id)
        );
      });

      if (repetido) {
        aviso("danger", 'Ya existe un producto llamado "' + nombreProducto + '". Edítalo desde el listado.');
        return;
      }

      const datos = {
        nombre: nombreProducto,
        descripcion: descripcion.value,
        precio: Number(precio.value),
        stock: Number(stock.value),
        categoria: nombreProducto,
        // La tienda vive en la raiz del proyecto: se guarda la ruta sin "../".
        imagen: imagenEscrita || (producto && producto.imagen) || IMAGEN_DEFECTO
      };

      if (producto) {
        actualizarProducto(producto.id, datos);
        flash("success", "Producto actualizado correctamente.");
      } else {
        crearProducto(datos);
        flash("success", "Producto creado correctamente. Ya esta a la venta en la tienda.");
      }

      window.location.href = "listado-pro.html";
    }

    boton.addEventListener("click", guardar);
    formulario.addEventListener("submit", guardar);
  }

  /* ---------------------- CLIENTES ---------------------- */

  function listadoClientes() {
    const tbody = cuerpoTabla();
    if (!tbody) return;

    const pintar = function () {
      const filtro = normalizarTexto(buscador() ? buscador().value : "");
      const clientes = listarClientes().filter(function (cliente) {
        if (!filtro) return true;
        return normalizarTexto(
          [cliente.nombre, cliente.apellido, cliente.email, cliente.celular, cliente.direccion].join(" ")
        ).indexOf(filtro) !== -1;
      });

      if (!clientes.length) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center text-muted py-4">No hay clientes para mostrar.</td></tr>';
        return;
      }

      tbody.innerHTML = clientes
        .map(function (cliente, indice) {
          return (
            "<tr>" +
            "<td>" + (indice + 1) + "</td>" +
            '<td class="font-weight-bold">' + escaparHtml(cliente.nombre) + "</td>" +
            "<td>" + escaparHtml(cliente.apellido) + "</td>" +
            "<td>" + escaparHtml(cliente.email) + "</td>" +
            "<td>" + escaparHtml(cliente.celular) + "</td>" +
            '<td class="text-muted small">' + escaparHtml(cliente.direccion || "Sin dirección") + "</td>" +
            botonesAccion(cliente.id, "crear-cliente.html", false) +
            "</tr>"
          );
        })
        .join("");
    };

    if (buscador()) buscador().addEventListener("input", pintar);

    tbody.addEventListener("click", function (evento) {
      const boton = evento.target.closest("[data-eliminar]");
      if (!boton) return;

      const cliente = obtenerCliente(boton.getAttribute("data-eliminar"));
      if (!cliente) return;
      if (!confirmarEliminacion('el cliente "' + cliente.nombre + " " + cliente.apellido + '"')) return;

      eliminarCliente(cliente.id);
      pintar();
      aviso("success", "Cliente eliminado correctamente.");
    });

    pintar();
  }

  function formularioCliente() {
    const formulario = qs("#formulario-cliente");
    if (!formulario) return;

    const campos = {
      nombre: qs("#nombre-cli"),
      apellido: qs("#apellido-cli"),
      email: qs("#email-cli"),
      celular: qs("#celular-cli"),
      direccion: qs("#direccion-cli"),
      direccion2: qs("#direccion2-cli"),
      notas: qs("#descripcion-cli")
    };

    const boton = qs("button[type='submit']", formulario);
    const cliente = ID_EDICION ? obtenerCliente(ID_EDICION) : null;

    if (cliente) {
      Object.keys(campos).forEach(function (clave) {
        if (campos[clave]) campos[clave].value = cliente[clave] || "";
      });
      if (boton) boton.textContent = "Actualizar Cliente";
    }

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const datos = {
        nombre: campos.nombre ? campos.nombre.value : "",
        apellido: campos.apellido ? campos.apellido.value : "",
        email: campos.email ? campos.email.value : "",
        celular: campos.celular ? campos.celular.value : "",
        direccion: campos.direccion ? campos.direccion.value : "",
        direccion2: campos.direccion2 ? campos.direccion2.value : "",
        notas: campos.notas ? campos.notas.value : ""
      };

      if (!datos.nombre.trim() || !datos.apellido.trim()) {
        aviso("danger", "El nombre y el apellido son obligatorios.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        aviso("danger", "Ingresa un correo electrónico válido.");
        return;
      }

      if (cliente) {
        actualizarCliente(cliente.id, datos);
        flash("success", "Cliente actualizado correctamente.");
      } else {
        crearCliente(datos);
        flash("success", "Cliente creado correctamente.");
      }

      window.location.href = "listado-clientes.html";
    });
  }

  /* ----------------------- PEDIDOS ---------------------- */

  const CLASES_ESTADO = {
    Pendiente: "badge-warning",
    "En proceso": "badge-info",
    "En camino": "badge-primary",
    Entregado: "badge-success",
    Cancelado: "badge-danger"
  };

  function listadoPedidos() {
    const tbody = cuerpoTabla();
    if (!tbody) return;

    const pintar = function () {
      const filtro = normalizarTexto(buscador() ? buscador().value : "");
      const pedidos = listarPedidos().filter(function (pedido) {
        if (!filtro) return true;
        return normalizarTexto(
          [pedido.numero, pedido.clienteNombre, pedido.clienteEmail, pedido.estado].join(" ")
        ).indexOf(filtro) !== -1;
      });

      if (!pedidos.length) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center text-muted py-4">No hay pedidos para mostrar.</td></tr>';
        return;
      }

      tbody.innerHTML = pedidos
        .map(function (pedido, indice) {
          return (
            "<tr>" +
            "<td>" + (indice + 1) + "</td>" +
            '<td class="font-weight-bold">' + escaparHtml(pedido.clienteNombre || "Cliente eliminado") + "</td>" +
            '<td class="small text-muted">' + escaparHtml(pedido.clienteEmail || "-") + "</td>" +
            "<td>" + formatoFecha(pedido.fecha) + "</td>" +
            "<td>" + formatoPrecio(pedido.total) + "</td>" +
            '<td><span class="badge ' + (CLASES_ESTADO[pedido.estado] || "badge-secondary") + '">' +
            escaparHtml(pedido.estado) + "</span></td>" +
            botonesAccion(pedido.id, "crear-pedido.html", true) +
            "</tr>"
          );
        })
        .join("");
    };

    if (buscador()) buscador().addEventListener("input", pintar);

    tbody.addEventListener("click", function (evento) {
      const ver = evento.target.closest("[data-ver]");
      if (ver) {
        mostrarDetallePedido(ver.getAttribute("data-ver"));
        return;
      }

      const boton = evento.target.closest("[data-eliminar]");
      if (!boton) return;

      const pedido = obtenerPedido(boton.getAttribute("data-eliminar"));
      if (!pedido) return;
      if (!confirmarEliminacion("el pedido #" + pedido.numero)) return;

      eliminarPedido(pedido.id);
      pintar();
      aviso("success", "Pedido eliminado y stock devuelto al inventario.");
    });

    pintar();
  }

  function mostrarDetallePedido(id) {
    const pedido = obtenerPedido(id);
    if (!pedido) return;

    let modal = qs("#modalDetallePedido");

    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal fade";
      modal.id = "modalDetallePedido";
      modal.setAttribute("tabindex", "-1");
      modal.setAttribute("role", "dialog");
      modal.innerHTML =
        '<div class="modal-dialog modal-lg" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title">Detalle del pedido</h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">' +
        '<span aria-hidden="true">&times;</span></button>' +
        "</div>" +
        '<div class="modal-body" id="detalle-pedido-contenido"></div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>' +
        "</div></div></div>";
      document.body.appendChild(modal);
    }

    const contenido = qs("#detalle-pedido-contenido", modal);
    const productos = Array.isArray(pedido.productos) ? pedido.productos : [];

    contenido.innerHTML =
      '<div class="row mb-3">' +
      '<div class="col-sm-6"><strong>Pedido:</strong> #' + escaparHtml(pedido.numero) + "</div>" +
      '<div class="col-sm-6"><strong>Fecha:</strong> ' + formatoFechaHora(pedido.fecha) + "</div>" +
      '<div class="col-sm-6"><strong>Cliente:</strong> ' + escaparHtml(pedido.clienteNombre || "N/A") + "</div>" +
      '<div class="col-sm-6"><strong>Email:</strong> ' + escaparHtml(pedido.clienteEmail || "N/A") + "</div>" +
      '<div class="col-sm-6"><strong>Método de pago:</strong> ' + escaparHtml(pedido.metodoPago || "N/A") + "</div>" +
      '<div class="col-sm-6"><strong>Estado:</strong> <span class="badge ' +
      (CLASES_ESTADO[pedido.estado] || "badge-secondary") + '">' + escaparHtml(pedido.estado) + "</span></div>" +
      "</div>" +
      '<div class="table-responsive"><table class="table table-sm">' +
      '<thead class="thead-light"><tr><th>Producto</th><th class="text-right">Precio</th>' +
      '<th class="text-center">Cantidad</th><th class="text-right">Subtotal</th></tr></thead><tbody>' +
      (productos.length
        ? productos
            .map(function (item) {
              const precio = Number(item.precio) || 0;
              const cantidad = Number(item.cantidad) || 0;
              return (
                "<tr><td>" + escaparHtml(item.nombre || "Producto") + "</td>" +
                '<td class="text-right">' + formatoPrecio(precio) + "</td>" +
                '<td class="text-center">' + cantidad + "</td>" +
                '<td class="text-right">' + formatoPrecio(precio * cantidad) + "</td></tr>"
              );
            })
            .join("")
        : '<tr><td colspan="4" class="text-center text-muted">Sin productos registrados.</td></tr>') +
      "</tbody></table></div>" +
      '<div class="text-right">' +
      "<div>Subtotal: " + formatoPrecio(pedido.subtotal) + "</div>" +
      "<div>Descuento: -" + formatoPrecio(pedido.descuento) + "</div>" +
      "<div>Envío: " + formatoPrecio(pedido.envio) + "</div>" +
      "<div>Recargo: " + formatoPrecio(pedido.recargo) + "</div>" +
      '<div class="h5 mt-2">Total: ' + formatoPrecio(pedido.total) + "</div>" +
      "</div>" +
      (pedido.notas
        ? '<p class="mt-3 mb-0"><strong>Notas:</strong> ' + escaparHtml(pedido.notas) + "</p>"
        : "");

    window.jQuery(modal).modal("show");
  }

  function formularioPedido() {
    const formulario = qs("#formulario-pedido");
    if (!formulario) return;

    const selectCliente = qs("#id_cliente");
    const selectPago = qs("#metodo_pago");
    const descuento = qs("#descuento");
    const aumento = qs("#aumento");
    const totalTexto = qs("#total-pedido");
    const tabla = qs("#tabla-carrito");
    const tbody = tabla ? qs("tbody", tabla) : null;
    const boton = qs("button[type='submit']", formulario);
    const pedido = ID_EDICION ? obtenerPedido(ID_EDICION) : null;

    if (!selectCliente || !selectPago || !tbody || !boton) return;

    let carrito = [];
    let stockOriginal = {};

    // Clientes disponibles.
    selectCliente.innerHTML = '<option selected value="">Seleccionar Cliente</option>';
    listarClientes().forEach(function (cliente) {
      const opcion = document.createElement("option");
      opcion.value = cliente.id;
      opcion.textContent = (cliente.nombre + " " + cliente.apellido).trim() + " - " + cliente.email;
      selectCliente.appendChild(opcion);
    });

    // Selector para agregar productos al pedido.
    const bloqueProductos = qs("#tabla-carrito", formulario).closest(".form-outline");
    if (bloqueProductos) {
      const agregador = document.createElement("div");
      agregador.className = "input-group mb-3";
      agregador.innerHTML =
        '<select id="producto-pedido" class="form-control"></select>' +
        '<div class="input-group-append">' +
        '<button class="btn btn-primary" type="button" id="btn-agregar-producto">' +
        '<i class="fas fa-plus"></i> Agregar</button></div>';
      bloqueProductos.insertBefore(agregador, tabla);
    }

    const selectProducto = qs("#producto-pedido");
    const btnAgregar = qs("#btn-agregar-producto");

    function llenarProductos() {
      if (!selectProducto) return;
      selectProducto.innerHTML = '<option selected value="">Seleccionar producto</option>';
      listarProductos().forEach(function (producto) {
        const opcion = document.createElement("option");
        opcion.value = producto.id;
        const stock = Number(producto.stock) || 0;
        opcion.textContent =
          producto.nombre + " - " + formatoPrecio(producto.precio) + " (stock: " + stock + ")";
        selectProducto.appendChild(opcion);
      });
    }

    function disponibles(productoId) {
      const producto = obtenerProducto(productoId);
      return producto ? Number(producto.stock) || 0 : 0;
    }

    function calcular() {
      const subtotal = carrito.reduce(function (total, item) {
        return total + item.precio * item.cantidad;
      }, 0);
      const desc = Math.max(0, Number(descuento.value) || 0);
      const envio = Math.max(0, Number(aumento.value) || 0);
      const total = Math.max(0, subtotal - desc + envio);

      if (totalTexto) totalTexto.textContent = formatoPrecio(total);

      return { subtotal: subtotal, descuento: desc, envio: envio, total: total };
    }

    function pintarCarrito() {
      if (!carrito.length) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-center text-muted">Agrega productos al pedido.</td></tr>';
      } else {
        tbody.innerHTML = carrito
          .map(function (item, indice) {
            return (
              "<tr>" +
              "<td>" + escaparHtml(item.nombre) + "</td>" +
              "<td>" + formatoPrecio(item.precio) + "</td>" +
              '<td><input type="number" min="1" class="form-control form-control-sm" ' +
              'style="width:80px" data-cantidad="' + indice + '" value="' + item.cantidad + '"></td>' +
              "<td>" + formatoPrecio(item.precio * item.cantidad) + "</td>" +
              '<td><button type="button" class="btn btn-danger btn-sm" data-quitar="' + indice + '">' +
              '<i class="fas fa-times"></i></button></td>' +
              "</tr>"
            );
          })
          .join("");
      }

      calcular();
    }

    function agregarProducto() {
      if (!selectProducto) return;
      const id = selectProducto.value;
      if (!id) {
        aviso("danger", "Selecciona un producto para agregar.");
        return;
      }

      const producto = obtenerProducto(id);
      if (!producto) return;

      if (disponibles(id) <= 0) {
        aviso("danger", "Ese producto no tiene stock disponible.");
        return;
      }

      const existente = carrito.find(function (item) {
        return item.id === id;
      });

      if (existente) {
        if (existente.cantidad + 1 > disponibles(id)) {
          aviso("danger", "No hay más stock disponible de " + producto.nombre + ".");
          return;
        }
        existente.cantidad += 1;
      } else {
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio) || 0,
          cantidad: 1
        });
      }

      selectProducto.value = "";
      pintarCarrito();
    }

    if (btnAgregar) btnAgregar.addEventListener("click", agregarProducto);

    tbody.addEventListener("change", function (evento) {
      const entrada = evento.target.closest("[data-cantidad]");
      if (!entrada) return;

      const indice = Number(entrada.getAttribute("data-cantidad"));
      const item = carrito[indice];
      if (!item) return;

      let cantidad = Math.floor(Number(entrada.value) || 0);
      const tope = disponibles(item.id) + (stockOriginal[item.id] || 0);

      if (cantidad < 1) cantidad = 1;
      if (cantidad > tope) {
        cantidad = tope;
        aviso("warning", "Solo hay " + tope + " unidades disponibles de " + item.nombre + ".");
      }

      item.cantidad = cantidad;
      pintarCarrito();
    });

    tbody.addEventListener("click", function (evento) {
      const botonQuitar = evento.target.closest("[data-quitar]");
      if (!botonQuitar) return;
      carrito.splice(Number(botonQuitar.getAttribute("data-quitar")), 1);
      pintarCarrito();
    });

    if (descuento) descuento.addEventListener("input", calcular);
    if (aumento) aumento.addEventListener("input", calcular);

    // Edicion: se cargan los datos del pedido y el estado.
    if (pedido) {
      (pedido.productos || []).forEach(function (item) {
        carrito.push({
          id: item.id,
          nombre: item.nombre,
          precio: Number(item.precio) || 0,
          cantidad: Number(item.cantidad) || 1
        });
        stockOriginal[item.id] = (stockOriginal[item.id] || 0) + (Number(item.cantidad) || 0);
      });

      selectCliente.value = pedido.clienteId || "";
      if (selectPago) {
        selectPago.value = pedido.metodoPago || "Efectivo";
        // Los pedidos de la tienda pueden usar un metodo que no esta en la lista.
        if (pedido.metodoPago && selectPago.value !== pedido.metodoPago) {
          const opcion = document.createElement("option");
          opcion.value = pedido.metodoPago;
          opcion.textContent = pedido.metodoPago;
          selectPago.appendChild(opcion);
          selectPago.value = pedido.metodoPago;
        }
      }
      if (descuento) descuento.value = Number(pedido.descuento) || 0;
      if (aumento) aumento.value = Number(pedido.envio) || 0;

      // Selector de estado (solo al editar, para no alterar el diseno de creacion).
      if (selectPago && selectPago.parentNode && selectPago.parentNode.parentNode) {
        const grupo = document.createElement("div");
        grupo.className = "form-outline mb-4";
        grupo.innerHTML =
          '<select id="estado_pedido" class="form-control">' +
          ESTADOS_PEDIDO.map(function (estado) {
            return '<option value="' + estado + '">' + estado + "</option>";
          }).join("") +
          '</select><label class="form-label" for="estado_pedido">Estado del Pedido</label>';
        selectPago.parentNode.parentNode.insertBefore(grupo, selectPago.parentNode.nextSibling);
        qs("#estado_pedido").value = pedido.estado;
      }

      if (boton) boton.textContent = "Actualizar Pedido";
    }

    llenarProductos();
    pintarCarrito();
    calcular();

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      if (!selectCliente.value) {
        aviso("danger", "Selecciona el cliente del pedido.");
        return;
      }

      if (!carrito.length) {
        aviso("danger", "Agrega al menos un producto al pedido.");
        return;
      }

      const productoInvalido = carrito.find(function (item) {
        return !obtenerProducto(item.id);
      });

      if (productoInvalido) {
        aviso("danger", "Un producto del pedido ya no existe en el inventario.");
        return;
      }

      const cliente = obtenerCliente(selectCliente.value);
      const totales = calcular();
      const estado = qs("#estado_pedido") ? qs("#estado_pedido").value : "Pendiente";

      const datos = {
        clienteId: cliente ? cliente.id : "",
        clienteNombre: cliente ? (cliente.nombre + " " + cliente.apellido).trim() : "",
        clienteEmail: cliente ? cliente.email : "",
        productos: carrito.map(function (item) {
          return {
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad
          };
        }),
        subtotal: totales.subtotal,
        descuento: totales.descuento,
        envio: totales.envio,
        total: totales.total,
        metodoPago: selectPago.value,
        estado: estado
      };

      if (pedido) {
        actualizarPedido(pedido.id, datos);
        flash("success", "Pedido actualizado correctamente.");
      } else {
        crearPedido(datos);
        flash("success", "Pedido creado correctamente.");
      }

      window.location.href = "listado-pedidos.html";
    });
  }

  /* ----------------------- USUARIOS --------------------- */

  function listadoUsuarios() {
    const tbody = cuerpoTabla();
    if (!tbody) return;

    const sesion = sesionActual() || {};

    const pintar = function () {
      const filtro = normalizarTexto(buscador() ? buscador().value : "");
      const usuarios = listarUsuarios().filter(function (usuario) {
        if (!filtro) return true;
        return normalizarTexto(usuario.usuario + " " + (ROLES[usuario.rol] || usuario.rol)).indexOf(filtro) !== -1;
      });

      if (!usuarios.length) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-center text-muted py-4">No hay usuarios para mostrar.</td></tr>';
        return;
      }

      tbody.innerHTML = usuarios
        .map(function (usuario, indice) {
          const claseRol =
            usuario.rol === "administrador" ? "badge-danger" :
            usuario.rol === "cajero" ? "badge-info" : "badge-primary";

          return (
            "<tr>" +
            "<td>" + (indice + 1) + "</td>" +
            '<td class="font-weight-bold">' + escaparHtml(usuario.usuario) +
            (usuario.id === sesion.id ? ' <span class="badge badge-secondary">Tú</span>' : "") + "</td>" +
            '<td><span class="badge ' + claseRol + '">' +
            escaparHtml(ROLES[usuario.rol] || usuario.rol) + "</span></td>" +
            "<td>" + formatoFecha(usuario.creado) + "</td>" +
            botonesAccion(usuario.id, "crear-usuario.html", false) +
            "</tr>"
          );
        })
        .join("");
    };

    if (buscador()) buscador().addEventListener("input", pintar);

    tbody.addEventListener("click", function (evento) {
      const boton = evento.target.closest("[data-eliminar]");
      if (!boton) return;

      const usuario = obtenerUsuario(boton.getAttribute("data-eliminar"));
      if (!usuario) return;

      if (usuario.id === sesion.id) {
        aviso("danger", "No puedes eliminar el usuario con el que iniciaste sesión.");
        return;
      }

      const administradores = listarUsuarios().filter(function (item) {
        return item.rol === "administrador";
      });

      if (usuario.rol === "administrador" && administradores.length <= 1) {
        aviso("danger", "Debe existir al menos un usuario administrador.");
        return;
      }

      if (!confirmarEliminacion('el usuario "' + usuario.usuario + '"')) return;

      eliminarUsuario(usuario.id);
      pintar();
      aviso("success", "Usuario eliminado correctamente.");
    });

    pintar();
  }

  function formularioUsuario() {
    const formulario = qs("#formulario-usuario");
    if (!formulario) return;

    const rol = qs("#rol");
    const usuario = qs("#usuario");
    const contrasena = qs("#contrasena");
    const confirmar = qs("#confirmar_contrasena");
    const boton = qs("button[type='submit']", formulario);
    const registro = ID_EDICION ? obtenerUsuario(ID_EDICION) : null;

    if (!rol || !usuario || !contrasena || !confirmar) return;

    // El vendedor no puede crear ni asignar el rol administrador.
    if (!esAdministrador() && rol) {
      Array.prototype.forEach.call(rol.options, function (opcion) {
        if (opcion.value === "administrador") opcion.disabled = true;
      });
      if (registro && registro.rol === "administrador") {
        aviso("warning", "Solo un administrador puede modificar esta cuenta.");
      }
    }

    if (registro) {
      rol.value = registro.rol;
      usuario.value = registro.usuario;
      contrasena.value = "";
      confirmar.value = "";
      contrasena.removeAttribute("required");
      confirmar.removeAttribute("required");
      contrasena.setAttribute("placeholder", "Dejar vacío para conservar la actual");
      if (boton) boton.textContent = "Actualizar Usuario";
    }

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const nombre = usuario.value.trim();
      const clave = contrasena.value;
      const repetida = confirmar.value;

      if (!rol.value || /^seleccionar/i.test(rol.value)) {
        aviso("danger", "Selecciona el rol del usuario.");
        return;
      }

      if (!esAdministrador() && rol.value === "administrador") {
        aviso("danger", "Solo un administrador puede crear otro administrador.");
        return;
      }

      if (nombre.length < 3) {
        aviso("danger", "El nombre de usuario debe tener al menos 3 caracteres.");
        return;
      }

      if (!registro && clave.length < 5) {
        aviso("danger", "La contraseña debe tener al menos 5 caracteres.");
        return;
      }

      if (clave && clave.length < 5) {
        aviso("danger", "La contraseña debe tener al menos 5 caracteres.");
        return;
      }

      if (clave !== repetida) {
        aviso("danger", "Las contraseñas no coinciden.");
        return;
      }

      const repetido = listarUsuarios().some(function (item) {
        return normalizarTexto(item.usuario) === normalizarTexto(nombre) &&
          (!registro || item.id !== registro.id);
      });

      if (repetido) {
        aviso("danger", "Ese nombre de usuario ya existe.");
        return;
      }

      const datos = {
        usuario: nombre,
        contrasena: clave,
        rol: rol.value === "administrador" ? "administrador" : rol.value
      };

      if (registro) {
        actualizarUsuario(registro.id, datos);
        flash("success", "Usuario actualizado correctamente.");
      } else {
        crearUsuario(datos);
        flash("success", "Usuario creado correctamente.");
      }

      window.location.href = "listado-usuarios.html";
    });
  }

  /* ---------------------- ARRANQUE ---------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    if (!sesionActual()) return;

    switch (PAGINA) {
      case "listado-pro.html":
        listadoProductos();
        break;
      case "crear-pro.html":
        formularioProducto();
        break;
      case "listado-clientes.html":
        listadoClientes();
        break;
      case "crear-cliente.html":
        formularioCliente();
        break;
      case "listado-pedidos.html":
        listadoPedidos();
        break;
      case "crear-pedido.html":
        formularioPedido();
        break;
      case "listado-usuarios.html":
        listadoUsuarios();
        break;
      case "crear-usuario.html":
        formularioUsuario();
        break;
      default:
        break;
    }
  });
})();
