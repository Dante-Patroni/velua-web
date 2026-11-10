<!-- Un PR chico, de un solo tema. Lo que no aplique, borralo o marcalo "No aplica" con el motivo. -->

## Qué cambia y por qué


## Cómo se probó
<!-- tsc -b, ESLint, Vitest (cantidad), `npm run tipos` sin cambios, mutaciones, prueba manual (pantallas, Slow 3G, rol). Lo que no se pudo probar, y por qué. -->


## Fuera de este PR
<!-- Lo que queda para otro PR, para que la revisión no lo busque acá. -->


## Seguridad
<!-- Cada pregunta con una línea: dónde está resuelto (archivo, test) o "No aplica" con el motivo. -->

- [ ] **¿Quién ve esto?** Esconder un botón es comodidad: el control real es el 403 de la API. Si depende del rol, la regla está en un solo lugar (utils) y tiene test. Si la sesión falla o no responde, el panel manda al login y no se dibuja.
- [ ] **¿Confío en algo que viene del navegador?** El cuerpo se arma campo por campo: un campo agregado a mano no viaja. Parámetros de la URL, `localStorage` y campos ocultos no deciden nada: el estado del pedido sale de la API y los totales de `/cotizar`.
- [ ] **¿Cómo se muestra lo que viene de afuera?** Sin `dangerouslySetInnerHTML`. Un `href` o `src` armado con datos no puede ser `javascript:`; el texto de un enlace va con `encodeURIComponent`, y los externos con `rel="noopener noreferrer"` (`noreferrer` evita mandar la URL del pedido).
- [ ] **¿Los errores se muestran por código?** Mensajes desde `mappings.ts`, nunca el texto de la API ni detalles internos.
- [ ] **¿Qué queda en el navegador?** Ni tokens ni datos de clientas en `localStorage`, en la URL ni en `console.log` (el carrito guarda solo ids y cantidades). Las variables `VITE_` son públicas: nunca un secreto; si falta una, la pantalla no promete lo que no puede cumplir.
- [ ] **¿Dependencias nuevas?** Justificadas y con `npm audit`.
- [ ] **¿Algún test falla si saco el control?** Quitá el control (comentalo o invertí la condición), corré Vitest y confirmá que al menos un test se pone en rojo. Después restauralo. Anotá cuántos fallaron.
