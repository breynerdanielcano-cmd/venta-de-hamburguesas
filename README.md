# Burger - Carrito de compras y proceso de pago

Actividad de JavaScript: carrito, detalle del carrito y proceso de pago,
hecha sobre la plantilla **Burger**. El carrito se guarda en `localStorage`,
por eso los productos pasan de una pagina a otra sin base de datos.

## Procesos de la actividad

| Proceso | Archivo principal | Que hace |
| --- | --- | --- |
| 1. Carrito | `index.html` + `js/carrito.js` | Al hacer clic en la canasta de un producto lo agrega al carrito, actualiza el contador del navbar y muestra el mini listado. |
| 2. Detalle del carrito | `cart.html` + `js/detalleCarrito.js` | Muestra producto, precio, cantidad, subtotal, permite sumar/restar/eliminar, elegir el destino y calcula subtotal, domicilio, promocion y total. |
| 3. Pagar | `checkout.html` + `js/checkout.js` + `thankyou.html` + `js/thankyou.js` | Toma los datos de entrega, permite sumar mas productos desde el resumen, elige el metodo de pago (Contraentrega +5%, PSE +3%, Transferencia), calcula el recargo y el total, y guarda la orden para mostrar la confirmacion. |

`js/tienda.js` tiene las funciones y datos compartidos: precios, destinos,
metodos de pago, formato de pesos y manejo del carrito en `localStorage`.

## Flujo

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

## Como abrir el proyecto

Con doble clic en `index.html`, o con un servidor local para evitar problemas
de cache del navegador:

```bash
python -m http.server 5500
```

Luego abrir `http://localhost:5500/index.html`.
