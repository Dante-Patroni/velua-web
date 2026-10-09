# IDEAS.md — velua-web

Ideas que quedaron fuera del alcance actual. No se implementan sin pedido
explícito: cuando una se aprueba, se mueve al plan y se borra de acá.

## Pie de la tienda

- **Data Fiscal de ARCA. Obligatorio, no es opcional.** Quien vende a
  consumidores finales por internet tiene que mostrar el logo del Formulario
  960 con su QR. Lo saca la titular con su clave fiscal, cargando la URL del
  sitio; ARCA devuelve un código HTML que va en el pie, al lado del enlace de
  Defensa del Consumidor. Pendiente del trámite.
- **Newsletter "Novedades".** El diseño tiene un campo "Tu correo" con el botón
  "Suscribirme" para avisar cuando sale una tanda nueva. No hay endpoint de
  suscripción.
- **Páginas de ayuda.** "Cómo comprar", "Envíos y retiro" y "Preguntas
  frecuentes" están en el diseño pero no tienen contenido ni ruta.

## Portada

- **Cantidad de productos por colección.** El diseño muestra "6 jabones" en
  cada colección. `Categoria` no trae ese dato: hace falta un campo en el
  backend (por ejemplo `cantidadProductos`), para no pedir una vez cada
  colección solo para contar.
- **Bloque "Sobre Velua".** Está en el diseño, pero se muestra recién cuando la
  marca mande el texto de su historia.
- **Foto de tapa.** El encabezado de la portada usa la ilustración de caléndulas
  mientras no haya una foto de los jabones. Cuando llegue, va optimizada
  (WebP, 1600 px, menos de 300 KB).

## Franja superior

- **Condiciones comerciales en la franja.** En el teléfono, el diseño dice
  "Envío gratis desde [MONTO] · [X]% off con transferencia". Los dos valores
  viven en el backend: se pueden mostrar cuando haya un endpoint público que los
  devuelva. Mientras tanto, la franja muestra las promesas de la marca.

## Marca

- **Logo en SVG.** Hoy el encabezado usa `src/assets/Logo-velua.png` (867 × 434,
  unos 73 KB). Un SVG pesa menos y se ve nítido en cualquier pantalla: si la
  marca lo tiene, reemplazarlo.
- **Logo sin frase para tamaños chicos.** Versión del logo sin la frase
  "Cosmética natural artesanal" para tamaños chicos: en el encabezado del
  teléfono la frase es ilegible.

## Colecciones

- **"Ver todos los jabones".** En la página de una categoría con hijas, un enlace
  que muestre la grilla de productos de todas sus colecciones. La API ya lo
  resuelve con `GET /productos?categoria=<slug-padre>`; falta decidir la URL
  (por ejemplo `/jabones?ver=todos`) y el diseño. Mientras las colecciones estén
  en el primer nivel, nadie lo vería.
