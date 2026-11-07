<!-- Un PR chico, de un solo tema. Lo que no aplique, borralo o marcalo "No aplica" con el motivo. -->

## Qué cambia y por qué


## Cómo se probó
<!-- tsc -b, ESLint, Vitest (cantidad), mutaciones, prueba manual (pantallas, Slow 3G, rol). Lo que no se pudo probar, y por qué. -->


## Fuera de este PR
<!-- Lo que queda para otro PR, para que la revisión no lo busque acá. -->


## Seguridad
<!-- Cada pregunta con una línea: dónde está resuelto (archivo, test) o "No aplica" con el motivo. -->

- [ ] **¿Quién ve esto?** Esconder un botón es comodidad: el control real es el 403 de la API. Si depende del rol, la regla está en un solo lugar (utils) y tiene test.
- [ ] **¿Qué viaja a la API?** El cuerpo se arma campo por campo: un campo agregado a mano al formulario no viaja.
- [ ] **¿Cómo se muestra lo que viene de afuera?** Sin `dangerouslySetInnerHTML`. Los datos del pedido no arman URLs; si un enlace lleva texto, va con `encodeURIComponent`, y los externos con `rel="noopener noreferrer"`.
- [ ] **¿Los errores se muestran por código?** Mensajes desde `mappings.ts`, nunca el texto de la API ni detalles internos.
- [ ] **¿Variables `VITE_`?** Son públicas (van dentro del código que se descarga): nunca un secreto. Si falta una, la pantalla no promete lo que no puede cumplir.
- [ ] **¿Dependencias nuevas?** Justificadas y con `npm audit`.
- [ ] **¿Tipos desde `main`?** `npm run tipos` no deja cambios.
