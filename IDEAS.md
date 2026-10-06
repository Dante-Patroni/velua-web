# IDEAS.md — velua-web

Ideas que quedaron fuera del alcance actual. No se implementan sin pedido
explícito: cuando una se aprueba, se mueve al plan y se borra de acá.

## Pie de la tienda

- **Newsletter "Novedades".** El diseño tiene un campo "Tu correo" con el botón
  "Suscribirme" para avisar cuando sale una tanda nueva. No hay endpoint de
  suscripción.
- **Páginas de ayuda.** "Cómo comprar", "Envíos y retiro" y "Preguntas
  frecuentes" están en el diseño pero no tienen contenido ni ruta.

## Franja superior

- **Condiciones comerciales en la franja.** En el teléfono, el diseño dice
  "Envío gratis desde [MONTO] · [X]% off con transferencia". Los dos valores
  viven en el backend: se pueden mostrar cuando haya un endpoint público que los
  devuelva. Mientras tanto, la franja muestra las promesas de la marca.

## Marca

- **Logo en SVG.** Hoy el encabezado usa `src/assets/Logo-velua.png` (867 × 434,
  unos 73 KB). Un SVG pesa menos y se ve nítido en cualquier pantalla: si la
  marca lo tiene, reemplazarlo.
