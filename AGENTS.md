# AGENTS.md — velua-web

> **Proyecto:** Tienda online de Velua, cosmética natural artesanal
> **Rol esperado del agente:** Ingeniero de Software / Especialista en React
> **Backend:** `velua-api` (Node + Express + MySQL). El contrato vive en su OpenAPI.

## 1) Propósito

Define cómo debe trabajar cualquier agente de IA en este repositorio.

Objetivos:

- Mantener la arquitectura y las convenciones heredadas del proyecto anterior.
- **Proteger las reglas de dominio de la sección 5.** Son las que se rompen aplicando la solución más obvia.
- Evitar regresiones y mantener homogéneo el manejo de errores.
- Enseñar mientras se implementa: por qué, qué y cómo.

Esto es una tienda real. Un total mal calculado o un precio viejo en pantalla cuesta dinero y credibilidad.

---

## 2) Forma de trabajo esperada

1. Entender el requerimiento y el contexto real del código.
2. Explicar el plan en tres pasos: por qué, qué y cómo.
3. Implementar cambios pequeños, seguros y verificables.
4. Validar con tests y ejecuciones relevantes.
5. Entregar resumen con archivos tocados, validaciones y pendientes.

Reglas:

- No hacer cambios fuera de alcance.
- Si aparece algo inesperado en el repo, frenar y avisar.
- Si el contrato de la API no alcanza para resolver algo, **no inventar el endpoint**: avisar para que se acuerde con el backend.
- Ideas nuevas van a `IDEAS.md`, no al código.

---

## 3) Stack

| Herramienta | Propósito |
|---|---|
| React 19 | UI |
| TypeScript | Tipado estático |
| Vite | Bundler y dev server |
| React Router v7 (Data Mode) | Enrutamiento, loaders y actions |
| Tailwind CSS v4 | Estilos utility-first |
| `@base-ui/react` | Componentes base accesibles |
| `openapi-typescript` | Genera los tipos de la API desde el OpenAPI |

No se agregan dependencias sin justificar. En particular: no hace falta una librería de estado global, ni `socket.io-client`, ni un cliente HTTP externo.

---

## 4) Arquitectura

```
src/
├── app/
│   ├── routes.tsx              Router, loaders y actions
│   ├── rutasTienda.tsx         Rama pública
│   └── rutasAdmin.tsx          Rama privada, con carga diferida
├── assets/
├── auth/                       Solo aplica a la rama admin
│   ├── AuthContext.tsx
│   ├── authService.ts
│   ├── permisos.ts             admin | operador
│   ├── RequirePermiso.tsx
│   └── types.ts
├── carrito/
│   ├── CarritoContext.tsx      Estado del carrito y persistencia
│   ├── carritoStorage.ts       Lectura y escritura en localStorage
│   └── types.ts
├── components/
│   ├── layout/
│   │   ├── TiendaLayout.tsx    Header, carrito, footer
│   │   └── AdminLayout.tsx     Sidebar
│   ├── <Modulo>/
│   └── ui/                     Button, Input, Select, Card, Label, Precio
├── lib/
│   ├── api/                    Una función por operación, agrupada por entidad
│   │   └── <entidad>.api.ts
│   ├── apiFetch.ts             Wrapper de fetch. Único punto de red
│   ├── mappings.ts             Diccionarios de errores y estilos
│   ├── formato.ts              Moneda, fechas
│   └── utils.ts                Helpers puros
├── pages/
│   ├── Tienda/
│   ├── Admin/
│   ├── Legales/
│   └── Errores/
├── types/
│   ├── api.generated.ts        Generado desde OpenAPI. No editar a mano
│   ├── index.ts                Barrel
│   └── <entidad>.types.ts      Tipos de UI que no vienen de la API
├── index.css
└── main.tsx
```

---

## 5) Reglas de dominio · leer antes de tocar código

### 5.1 El frontend no calcula totales

Ningún componente, hook ni util suma precios, aplica descuentos ni calcula envío. Todo importe que se muestre en el carrito o el checkout viene de `POST /carrito/cotizar`.

Está prohibido replicar en TypeScript la lógica del cotizador del backend, aunque parezca trivial y aunque evite un viaje de red. Dos implementaciones de la misma regla divergen siempre, y el cliente termina viendo un total distinto al que se le cobra.

Única excepción: multiplicar precio por cantidad para mostrar el subtotal de una línea, que es informativo. El total nunca.

### 5.2 El carrito guarda ids y cantidades, nunca precios

```ts
type ItemCarrito = { varianteId: number; cantidad: number };
```

Nada de nombre, precio ni imagen persistidos. Al montar, el carrito se rehidrata pidiendo la cotización al backend, que devuelve los datos actuales de cada variante.

Si un precio cambió o una variante se quedó sin stock, el backend lo informa y la UI lo muestra. Guardar precios en `localStorage` significa mostrar precios viejos durante días.

### 5.3 El dinero se formatea, no se opera

La API devuelve importes como cadena decimal. Se convierten a número **solo para formatear**:

```ts
// lib/formato.ts
export const formatearPrecio = (valor: string) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })
    .format(Number(valor));
```

Nunca aritmética en punto flotante sobre importes. Si hace falta una cuenta, la hace el backend.

### 5.4 Los errores se muestran por código, no por mensaje

La API responde `{ "error": "CODIGO_DOMINIO" }` y, en validaciones, `{ "error": "DATOS_INVALIDOS", "details": {} }`.

El texto legible lo arma el frontend desde `lib/mappings.ts`, con un diccionario **por contexto**, porque el mismo código necesita decir cosas distintas según dónde aparezca:

```ts
export const MENSAJES_ERROR = {
  ficha:    { STOCK_INSUFICIENTE: "Nos quedan menos unidades de las que pediste." },
  checkout: { STOCK_INSUFICIENTE: "Alguien se adelantó. Revisá tu carrito antes de pagar." },
  general:  { STOCK_INSUFICIENTE: "No hay stock suficiente." },
} as const;
```

Nunca mostrar el código crudo, y nunca depender de un `message` en inglés del backend.

### 5.5 El badge de descuento tiene condición

Se muestra solo si existe `precioAnterior` **y** es mayor que el precio actual. Sin esa guarda aparecen ofertas del cero por ciento sobre cero pesos, que es el error que tienen en producción las dos tiendas del rubro que miramos.

### 5.6 Las imágenes vienen de Cloudinary

Nunca se construyen rutas a `/uploads/` del backend. La API devuelve la URL; el tamaño se pide por transformación en la propia URL. Todas las imágenes llevan `loading="lazy"` salvo la primera visible.

---

## 6) Las dos ramas de rutas

Esta es la diferencia estructural con el proyecto anterior: acá lo público es la mayoría y lo privado es el anexo.

**Rama tienda**, sin autenticación, con `TiendaLayout`:

```
/                       portada
/:categoria             listado
/productos/:slug        ficha
/carrito
/checkout
/pedido/:numero         seguimiento
/nosotros
/arrepentimiento
/terminos  /privacidad  /cambios
```

**Rama admin**, con `authLoader` y `AdminLayout`, cargada con `React.lazy`:

```
/admin/login
/admin                  pedidos
/admin/productos
/admin/categorias
/admin/cupones
/admin/configuracion
```

El código del panel nunca entra en el bundle de la tienda. Una clienta que entra desde Instagram no descarga el CRUD.

`RequirePermiso` y `permisos.ts` se mantienen, pero solo dentro de la rama admin y con dos roles: `admin` y `operador`.

---

## 7) Tipos generados desde el contrato

Los tipos de la API **no se escriben a mano**. Se generan:

```bash
npm run tipos    # openapi-typescript contra el OpenAPI de velua-api
```

`src/types/api.generated.ts` no se edita nunca. En `types/<entidad>.types.ts` van solo los tipos propios de la UI que no existen en la API.

Si el backend cambia una respuesta, la compilación rompe acá. Eso es lo que queremos: el desencuentro aparece en el editor y no en producción.

---

## 8) React Router en Data Mode

Se mantiene el patrón del proyecto anterior.

**Loaders** para lectura, antes de renderizar. Llaman a funciones de `lib/api/`, nunca a `fetch` directo.

**Actions** para escritura, con `<Form>` de react-router, inputs con `name`, `useNavigation()` para el estado de envío y `useActionData()` para los errores.

**Dónde no usar loaders:** el carrito. Es estado de cliente, vive en `CarritoContext` y se sincroniza con el endpoint de cotización. No es un recurso de ruta.

---

## 9) Autenticación del panel

**Cambio respecto del proyecto anterior:** el token no va en `localStorage`.

La tienda es pública y carga contenido de terceros. Un token accesible desde JavaScript es un token que un XSS puede robar, y ese token cambia precios y lee datos personales de clientas.

Se usa cookie `httpOnly`, emitida por la API, con frontend y API en subdominios del mismo dominio. En consecuencia:

```ts
// lib/apiFetch.ts
fetch(url, { ...options, credentials: "include" });
```

`apiFetch` no lee ni escribe tokens. La sesión la maneja el navegador. El `authLoader` verifica llamando a `GET /auth/yo`, no leyendo storage.

---

## 10) Convenciones de código

**Nomenclatura.** `PascalCase` para componentes y archivos de componente. Minúsculas con punto para módulos: `productos.api.ts`, `producto.types.ts`. Hooks y funciones en `camelCase`. Constantes de mapeo en `SCREAMING_SNAKE_CASE`. Todo en español.

**Tipos.** `import type` cuando solo se necesita la definición. Un tipo, un archivo, re-exportado desde el barrel. No duplicar.

**Componentes UI.** Usar siempre los de `components/ui/`. No `<button>`, `<input>` ni `<select>` crudos con clases Tailwind. Si un elemento se repite con estilos propios, se crea un wrapper.

**Capa de API.** Las funciones de red viven en `lib/api/<entidad>.api.ts` e invocan `apiFetch`. No hardcodear endpoints en componentes ni en loaders.

**Mappings.** Diccionarios y listas fijas en `lib/mappings.ts`. Helpers puros en `lib/utils.ts`. Nunca inline en un componente.

**Orden dentro de un componente.** Imports (React, Router, UI, tipos, utils, lib) → constantes locales → hooks (datos, navegación, estado, efectos, computados) → handlers → JSX.

**Tablas.** Se extraen a `components/<Modulo>/` si superan unas cincuenta líneas.

**JSDoc.** Toda función exportada lleva su bloque con `@description`, `@param` y `@returns`.

---

## 11) Estilo e identidad

Mobile first, sin excepción. La mayoría del tráfico llega desde Instagram, en el teléfono.

Los colores de marca se definen una vez como tokens de Tailwind v4 en `index.css`, y se usan por nombre:

```css
@theme {
  --color-violeta: #464BB3;   /* tipografía del logo, títulos, botones */
  --color-lila:    #D985C7;   /* trazo botánico, acentos, detalles */
}
```

Nunca hardcodear un hex en un componente. Si hace falta un color nuevo, se agrega al tema.

La marca es delicada y con aire: fotos grandes, mucho blanco, pocas cosas por fila. No replicar la densidad de las tiendas de suplementos.

---

## 12) SEO y metadatos

React 19 permite declarar `<title>` y `<meta>` directamente en el componente y los eleva al `head`. No hace falta una librería.

Cada ficha de producto define su título, su descripción y su `og:image`. Es lo mínimo para que un link compartido por WhatsApp muestre la foto del producto, que es como se va a compartir casi todo.

---

## 13) Variables de entorno

```env
VITE_API_URL=http://localhost:3000
```

Prefijo `VITE_` obligatorio. **Nunca** poner credenciales, claves de pago ni secretos: todo lo que está acá es público y visible en el bundle.

---

## 14) Flujo para agregar una sección

1. Confirmar que el endpoint existe en el OpenAPI. Si no existe, frenar y acordarlo.
2. Regenerar tipos con `npm run tipos`.
3. Crear las funciones en `lib/api/<entidad>.api.ts`.
4. Crear la página en `pages/<Rama>/`.
5. Extraer tabla o grilla a `components/` si crece.
6. Definir loader y action en el archivo de rutas de la rama que corresponda.
7. Agregar la ruta y, si es admin, el link en la sidebar.
8. Agregar los códigos de error nuevos a `lib/mappings.ts`, en los contextos donde aparezcan.

---

## 15) Testing

Vitest más Testing Library. Cobertura obligatoria:

- Lógica del carrito: agregar, quitar, cambiar cantidad, rehidratar, y qué pasa cuando una variante desapareció.
- Mapeo de códigos de error a mensajes, incluido el caso de un código desconocido.
- Formateo de precios.

No se cierra una tarea con tests en rojo. Si algo no se pudo correr, se declara.

---

## 16) Git

Commits atómicos, con qué cambia y por qué. Ramas de feature o chore. `main` protegida y siempre desplegable. Todo PR lo revisa la otra persona.

---

## 17) Checklist de cierre

1. Código coherente con la arquitectura y con la rama de rutas correcta.
2. Reglas de dominio de la sección 5 respetadas.
3. Tipos regenerados si cambió el contrato.
4. JSDoc en funciones exportadas nuevas o modificadas.
5. Errores mostrados por código y contexto.
6. Revisado en pantalla de teléfono, no solo en el escritorio.
7. Tests en verde.
8. Resumen con archivos modificados, validaciones y pendientes.

---

## 18) Fuera de alcance por ahora

No implementar sin pedido explícito: cuentas de clientas con historial, lista de deseos, comparador, chat en vivo, tienda mayorista, tiempo real con WebSockets, modo oscuro, internacionalización.

---

## 19) Regla de oro

Primero correcto, después prolijo, siempre consistente.

Entre rapidez y calidad estructural, elegir calidad estructural sin perder pragmatismo. Ante la duda en cualquier regla de la sección 5, frenar y preguntar antes de implementar.
