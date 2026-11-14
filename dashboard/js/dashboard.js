/* ==========================================================
   dashboard.js
   Logica comun del Dashboard: sesion, permisos, login,
   registro, mensajes y resumen de indicadores.

   La base de datos compartida con la tienda vive en
   ../js/datos.js (localStorage).
   ========================================================== */

(function () {
  "use strict";

  const FLASH_CLAVE = "burger_flash";

  function qs(selector, contexto) {
    return (contexto || document).querySelector(selector);
  }

  function qsa(selector, contexto) {
    return Array.prototype.slice.call((contexto || document).querySelectorAll(selector));
  }

  function crearAlerta(tipo, texto, contenedor) {
    const destino = contenedor || qs(".container-fluid") || document.body;
    const alerta = document.createElement("div");
    alerta.className = "alert alert-" + tipo + " alert-dismissible fade show";
    alerta.setAttribute("role", "alert");
    alerta.innerHTML =
      escaparHtml(texto) +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Cerrar">' +
      '<span aria-hidden="true">&times;</span></button>';

    if (destino.classList && destino.classList.contains("container-fluid")) {
      destino.insertBefore(alerta, destino.firstChild);
    } else {
      destino.insertBefore(alerta, destino.firstChild);
    }

    window.setTimeout(function () {
      if (alerta.parentNode) alerta.parentNode.removeChild(alerta);
    }, 5000);

    return alerta;
  }

  function guardarFlash(tipo, texto) {
    sessionStorage.setItem(FLASH_CLAVE, JSON.stringify({ tipo: tipo, texto: texto }));
  }

  function mostrarFlash() {
    const datos = sessionStorage.getItem(FLASH_CLAVE);
    if (!datos) return;
    sessionStorage.removeItem(FLASH_CLAVE);
    try {
      const flash = JSON.parse(datos);
      crearAlerta(flash.tipo || "success", flash.texto || "");
    } catch (error) {
      // Mensaje danado: se ignora.
    }
  }

  /* ----------------------- SESION ----------------------- */

  function sesionValida() {
    const sesion = sesionActual();
    if (!sesion) {
      window.location.replace("login.html");
      return false;
    }

    // Si el usuario fue eliminado desde el Dashboard se cierra la sesion.
    if (!obtenerUsuario(sesion.id)) {
      cerrarSesion();
      window.location.replace("login.html");
      return false;
    }

    return true;
  }

  function configurarSesionUI() {
    const sesion = sesionActual();
    if (!sesion) return;

    const etiquetaRol = ROLES[sesion.rol] || sesion.rol;
    qsa(".topbar .text-gray-600.small").forEach(function (elemento) {
      elemento.textContent = sesion.usuario + " \u00b7 " + etiquetaRol;
    });

    // El rol vendedor no puede eliminar registros.
    if (!puedeEliminar()) {
      qsa("[data-solo-admin]").forEach(function (elemento) {
        elemento.style.display = "none";
      });
    }
  }

  function configurarCerrarSesion() {
    qsa("#logoutModal a").forEach(function (enlace) {
      enlace.addEventListener("click", function () {
        cerrarSesion();
      });
    });

    qsa("[data-logout]").forEach(function (enlace) {
      enlace.addEventListener("click", function (evento) {
        evento.preventDefault();
        cerrarSesion();
        window.location.href = "login.html";
      });
    });
  }

  /* ------------------- RESUMEN (INICIO) ------------------ */

  function configurarResumen() {
    const fila = qs(".container-fluid > .row");
    if (!fila) return;

    const tarjetas = qsa(":scope > [class*='col-'] > .card", fila);
    if (tarjetas.length < 4) return;

    const productos = listarProductos();
    const clientes = listarClientes();
    const pedidos = listarPedidos();

    const valido = function (pedido) {
      return pedido && pedido.estado !== "Cancelado";
    };

    const ahora = new Date();
    const ventasMes = pedidos
      .filter(function (pedido) {
        if (!valido(pedido)) return false;
        const fecha = new Date(pedido.fecha);
        return (
          !isNaN(fecha.getTime()) &&
          fecha.getFullYear() === ahora.getFullYear() &&
          fecha.getMonth() === ahora.getMonth()
        );
      })
      .reduce(function (total, pedido) {
        return total + (Number(pedido.total) || 0);
      }, 0);

    const ventasTotales = pedidos.filter(valido).reduce(function (total, pedido) {
      return total + (Number(pedido.total) || 0);
    }, 0);

    const entregados = pedidos.filter(function (pedido) {
      return pedido.estado === "Entregado";
    }).length;

    const pendientes = pedidos.filter(function (pedido) {
      return pedido.estado === "Pendiente" || pedido.estado === "En proceso" || pedido.estado === "En camino";
    }).length;

    const porcentaje = pedidos.length ? Math.round((entregados / pedidos.length) * 100) : 0;

    const texto = function (indice, valor) {
      const elemento = qs(".h5", tarjetas[indice]);
      if (!elemento) return;
      elemento.textContent = valor;
      elemento.setAttribute("title", "Clientes: " + clientes.length + " | Productos: " + productos.length);
    };

    texto(0, formatoPrecio(ventasMes));
    texto(1, formatoPrecio(ventasTotales));
    texto(2, porcentaje + "%");
    texto(3, String(pendientes));

    const barra = qs(".progress-bar", tarjetas[2]);
    if (barra) {
      barra.style.width = porcentaje + "%";
      barra.setAttribute("aria-valuenow", String(porcentaje));
    }
  }

  /* ------------------------ LOGIN ----------------------- */

  function configurarLogin() {
    const formulario = qs("form.user");
    if (!formulario) return;

    const usuario = qs("#exampleInputEmail");
    const contrasena = qs("#exampleInputPassword");
    const boton = qs("a.btn.btn-primary.btn-user");
    if (!usuario || !contrasena || !boton) return;

    // Si venimos del registro, se muestra el mensaje guardado.
    const flash = sessionStorage.getItem(FLASH_CLAVE);
    if (flash) {
      try {
        const datos = JSON.parse(flash);
        sessionStorage.removeItem(FLASH_CLAVE);
        crearAlerta(datos.tipo || "success", datos.texto || "", formulario);
      } catch (error) {
        sessionStorage.removeItem(FLASH_CLAVE);
      }
    }

    function entrar(evento) {
      if (evento) evento.preventDefault();

      const nombre = usuario.value.trim();
      const clave = contrasena.value;

      if (!nombre || !clave) {
        crearAlerta("danger", "Ingresa el usuario y la contrase\u00f1a.", formulario);
        return;
      }

      const resultado = iniciarSesion(nombre, clave);
      if (!resultado.ok) {
        crearAlerta("danger", resultado.mensaje, formulario);
        return;
      }

      window.location.href = "index.html";
    }

    boton.addEventListener("click", entrar);
    formulario.addEventListener("submit", entrar);
  }

  /* ----------------------- REGISTRO --------------------- */

  function configurarRegistro() {
    const formulario = qs("form.user");
    if (!formulario) return;

    const nombre = qs("#exampleFirstName");
    const apellido = qs("#exampleLastName");
    const email = qs("#exampleInputEmail");
    const contrasena = qs("#exampleInputPassword");
    const repetir = qs("#exampleRepeatPassword");
    const boton = qs("a.btn.btn-primary.btn-user");
    if (!nombre || !contrasena || !repetir || !boton) return;

    function registrar(evento) {
      if (evento) evento.preventDefault();

      const usuario = (nombre.value + (apellido && apellido.value ? "." + apellido.value : "")).trim();
      const clave = contrasena.value;

      if (usuario.length < 3) {
        crearAlerta("danger", "El nombre debe tener al menos 3 caracteres.", formulario);
        return;
      }

      if (clave.length < 5) {
        crearAlerta("danger", "La contrase\u00f1a debe tener al menos 5 caracteres.", formulario);
        return;
      }

      if (clave !== repetir.value) {
        crearAlerta("danger", "Las contrase\u00f1as no coinciden.", formulario);
        return;
      }

      const repetido = listarUsuarios().some(function (item) {
        return normalizarTexto(item.usuario) === normalizarTexto(usuario);
      });

      if (repetido) {
        crearAlerta("danger", "Ese nombre de usuario ya existe.", formulario);
        return;
      }

      crearUsuario({ usuario: usuario, contrasena: clave, rol: "vendedor" });
      guardarFlash("success", "Cuenta creada con rol vendedor. Ya puedes iniciar sesi\u00f3n.");
      window.location.href = "login.html";
    }

    boton.addEventListener("click", registrar);
    formulario.addEventListener("submit", registrar);
  }

  /* ---------------------- ARRANQUE ---------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    const esDashboard = Boolean(qs("#accordionSidebar"));

    if (esDashboard) {
      if (!sesionValida()) return;
      configurarSesionUI();
      configurarCerrarSesion();
      configurarResumen();
      mostrarFlash();
      return;
    }

    if (qs("#exampleRepeatPassword")) {
      configurarRegistro();
    } else {
      configurarLogin();
    }
  });

  // Utilidad disponible para crud.js.
  window.dashboardAlerta = crearAlerta;
})();
