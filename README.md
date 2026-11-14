# Burger - Tienda, carrito, pago y Dashboard administrativo

Actividad de JavaScript: carrito, detalle del carrito, proceso de pago y
**Dashboard administrativo con CRUD**, hecha sobre la plantilla **Burger**.
Los datos se guardan en `localStorage`, por eso los productos, clientes,
pedidos y usuarios se comparten entre la tienda y el panel sin base de datos.

## Procesos de la actividad (Parte 1)

| Proceso | Archivo principal | Que hace |
| --- | --- | --- |
| 1. Carrito | `index.html` + `js/carrito.js` | Al hacer clic en la canasta de un producto lo agrega al carrito, actualiza el contador del navbar y muestra el mini listado. |
| 2. Detalle del carrito | `cart.html` + `js/detalleCarrito.js` | Muestra producto, precio, cantidad, subtotal, permite sumar/restar/eliminar, elegir el destino y calcula subtotal, domicilio, promocion y total. |
| 3. Pagar | `checkout.html` + `js/checkout.js` + `thankyou.html` + `js/thankyou.js` | Toma los datos de entrega, permite sumar mas productos desde el resumen, elige el metodo de pago (Contraentrega +5%, PSE +3%, Transferencia), calcula el recargo y el total, y guarda la orden para mostrar la confirmacion. |

`js/tienda.js` tiene las funciones y datos compartidos: precios, destinos,
metodos de pago, formato de pesos y manejo del carrito en `localStorage`.

## Flujo de la tienda

1. En el inicio se hace clic en el icono de la canasta de cada producto.
2. El contador del carrito sube y el producto aparece en el mini carrito.
3. Se entra a **Ver Carrito** (`cart.html`), se ajustan cantidades y se elige la ciudad.
4. Se pulsa **Ir a pagar** (`checkout.html`).
5. Se elige el metodo de pago y se completa el formulario de entrega.
6. **Pagar** guarda la orden y abre `thankyou.html` con el resumen final.

## Reglas de calculo

- Precios en pesos colombianos, por ejemplo `$6.500`.
- Domicilio segun la ciudad: Medellin $0, Bello $10.000, Itagui / Envigado /
  Sabaneta $15.000, La Estrella / Caldas / Copacabana $20.000.
- Promocion: 10% de descuento cuando la compra de productos supera `$100.000`.
- Recargo del metodo de pago: Contraentrega +5%, PSE +3%, Transferencia +0%.
- Total = productos + domicilio - promocion + recargo del pago.

## Ejemplo que coincide con el ejercicio

- 14 Italian Pizza x $6.500 = $91.000
- 4 Pizza Slice x $3.200 = $12.800
- Subtotal productos = $103.800
- Domicilio La Estrella = $20.000
- Promocion 10% = -$10.380
- Subtotal orden = $113.420
- Recargo Contraentrega 5% = $5.671
- **Total a pagar = $119.091**

---

## Parte 2: Dashboard administrativo

El panel administrativo esta en la carpeta `dashboard/`. Usa **los mismos
archivos HTML, CSS, JS e imagenes de la plantilla SB Admin 2 entregados por el
profesor** (mismo diseno, mismos nombres de pagina y mismos recursos en
`css/sb-admin-2*.css`, `js/sb-admin-2*.js`, `js/demo/*` e `img/undraw_*.svg`).
Sobre ese diseno se agrego el CRUD completo y la busqueda en vivo para
**Productos, Clientes, Pedidos y Usuarios**, con restricciones segun el rol.

### Como entrar

1. Abrir `http://localhost:5500/dashboard/login.html` (o el enlace
   **Dashboard** del menu de la tienda).
2. Usar una de las cuentas de prueba:

| Rol | Usuario | Contrasena |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Vendedor | `vendedor` | `vendedor123` |

Tambien se puede crear una cuenta de vendedor desde `dashboard/register.html`.

### Modulos

| Modulo | Listado | Crear / editar |
| --- | --- | --- |
| Productos | `dashboard/listado-pro.html` | `dashboard/crear-pro.html` (`?id=...` para editar) |
| Clientes | `dashboard/listado-clientes.html` | `dashboard/crear-cliente.html` |
| Pedidos | `dashboard/listado-pedidos.html` | `dashboard/crear-pedido.html` |
| Usuarios | `dashboard/listado-usuarios.html` | `dashboard/crear-usuario.html` |

Cada listado conserva el diseno del profesor y agrega busqueda en vivo
(producto, cliente, pedido o usuario), botones de editar y eliminar en la
columna **Acciones**, y el detalle del pedido en un modal.

### Permisos por rol

| Accion | Vendedor | Administrador |
| --- | --- | --- |
| Crear registros | Si | Si |
| Consultar / buscar | Si | Si |
| Editar registros | Si | Si |
| Eliminar registros | No | Si |
| Asignar rol administrador | No | Si |
| Editar cuentas administrador | No | Si |
| Eliminar su propia cuenta | No | No |
| Eliminar el ultimo administrador | No | No |

El vendedor no ve el boton de eliminar, solo puede crear usuarios con rol
**vendedor** y no puede asignar el rol administrador. El administrador puede
eliminar registros y gestionar todos los usuarios, salvo su propia cuenta y el
ultimo administrador.

### Integracion tienda + Dashboard

- `js/datos.js` es la capa de datos compartida: almacenamiento, datos iniciales,
  CRUD, autenticacion, roles y utilidades de formato.
- La tienda (`index.html`) dibuja los productos desde esa misma base, muestra
  el stock y marca los productos agotados.
- Al pagar en `checkout.html` se registran el cliente y el pedido en la base
  compartida, y se descuenta el stock de cada producto.
- Los pedidos creados en la tienda aparecen de inmediato en
  `dashboard/listado-pedidos.html`; los cambios de stock hechos en el panel se
  reflejan en la tienda.
- Cuando hay una sesion activa, el icono de usuario de la tienda abre el panel.

### Datos guardados

| Clave de `localStorage` | Contenido |
| --- | --- |
| `burger_productos` | Productos, precio, stock, imagen y categoria |
| `burger_clientes` | Clientes registrados |
| `burger_pedidos` | Pedidos de la tienda y del panel |
| `burger_usuarios` | Cuentas y roles |
| `burger_sesion` | Sesion activa |
| `burger_carrito` | Carrito de la tienda |
| `burger_orden` | Ultima orden confirmada |

Los datos iniciales se cargan automaticamente la primera vez: 12 productos,
3 clientes, 3 pedidos y 2 usuarios. Para volver al estado inicial, abrir la
consola del navegador y ejecutar:

```js
localStorage.clear();
location.reload();
```

> Nota: al ser un proyecto academico sin backend, las contrasenas se guardan
> en `localStorage`. En un entorno real deben validarse y hashearse en el
> servidor.

### Estructura relevante

```text
index.html                     Tienda (catalogo dinamico)
cart.html / checkout.html      Carrito y pago
dashboard/
  login.html / register.html   Autenticacion
  index.html                   Panel de control con estadisticas
  listado-*.html               Listados con busqueda y acciones (diseno del profesor)
  crear-*.html                 Formularios de crear / editar
  css/sb-admin-2.min.css       Estilos originales de SB Admin 2 (Bootstrap 4 incluido)
  css/sb-admin-2.css           Version sin minificar de los estilos originales
  js/sb-admin-2.min.js         Script original del template (menu, scroll, etc.)
  js/demo/chart-area-demo.js   Grafico de ventas mensuales con datos reales
  js/demo/chart-pie-demo.js    Grafico de pedidos por estado con datos reales
  img/undraw_*.svg             Ilustraciones originales del template
  js/dashboard.js              Sesion, roles, login, registro y estadisticas
  js/crud.js                   Controladores CRUD de los cuatro modulos
js/datos.js                    Base de datos compartida en localStorage
js/catalogo.js                 Catalogo dinamico de la tienda
js/carrito.js / js/checkout.js Carrito y registro del pedido en la base
```

## Como abrir el proyecto

Abre **esta carpeta completa** (`Proyecto predeterminado`) en Visual Studio
Code. El `index.html` de la tienda debe quedar **en la raiz** de la carpeta
que abres; si abres una carpeta que solo contiene otra carpeta adentro, Live
Server muestra una lista de archivos (se ve sin estilos ni centrado) o un
error.

### Opcion 1: Live Server (Visual Studio Code)

1. Archivo > Abrir carpeta > selecciona esta carpeta del proyecto.
2. Clic derecho sobre `index.html` > **Open with Live Server**.
3. Se abre `http://127.0.0.1:5501/index.html` (el puerto ya esta configurado
   en `.vscode/settings.json`).
4. Panel: `http://127.0.0.1:5501/dashboard/login.html`.
5. Usuarios de prueba: `admin / admin123` (administrador) y
   `vendedor / vendedor123` (vendedor).

Si aparece el aviso de que el puerto esta ocupado, cambia el numero en
Ajustes > Live Server > Settings: Port.

### Opcion 2: doble clic en `iniciar-tienda.bat`

Abre el servidor en el puerto 5500 y lanza el navegador:

- Tienda: `http://localhost:5500/index.html`
- Panel: `http://localhost:5500/dashboard/login.html`

Deja abierta la ventana negra mientras usas la pagina; al cerrarla se apaga
el servidor.

### Opcion 3: servidor de Python

```bash
python -m http.server 5500
```

Luego abrir `http://localhost:5500/index.html` para la tienda y
`http://localhost:5500/dashboard/login.html` para el panel.
