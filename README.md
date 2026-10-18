<div align="center">

Un catálogo para practicar el consumo de una API pública.

`HTML5` · `CSS3` · `JavaScript` · `Fetch API` · `DummyJSON`

</div>

---

## 🌿 La idea

**Trama** es un portal web académico que consume **DummyJSON Products**. Permite explorar productos y practicar solicitudes HTTP desde una interfaz de estilo editorial: tonos crema, verde bosque y acentos mandarina.

Cada interacción tiene una segunda lectura: además de usar el catálogo, puedes consultar el registro para entender qué datos envía el navegador y qué devuelve la API.

## ✨ Qué puedes hacer

- **Explorar:** consultar productos con imagen, precio en USD y existencias.
- **Encontrar:** buscar por nombre, filtrar por categoría y ordenar por nombre o precio.
- **Navegar:** recorrer el catálogo en páginas de 12 productos.
- **Consultar:** abrir la ficha de un producto con una petición individual.
- **Experimentar:** crear, editar y eliminar mediante solicitudes a la API.
- **Entender:** revisar las últimas 10 solicitudes, sus cuerpos, respuestas, estados HTTP y tiempos.

La interfaz se adapta a dispositivos móviles e incluye validación de formularios, mensajes de carga y manejo de errores.

## ⚡ Ponlo en marcha

1. Descarga el proyecto
2. Abre la carpeta en **Visual Studio Code**.
3. Con la extensión **Live Server** instalada, haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
4. Explora el catálogo y prueba sus operaciones.

También puedes abrir `index.html` directamente en un navegador moderno. Necesitas conexión a internet para consultar la API y cargar las imágenes.

**No requiere npm, compilación, API key ni un backend propio.**

## 🧩 Tres archivos, una experiencia

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura del catálogo, filtros, ventana de detalle y formularios. |
| `styles.css` | Identidad visual, estilos de los controles y adaptación a distintos tamaños de pantalla. |
| `app.js` | Solicitudes HTTP, eventos, validación, filtros, paginación y actualización del DOM. |

## 🔄 Del clic a la API

Base utilizada: `https://dummyjson.com`

| Método | Ruta | Acción en Trama |
|---|---|---|
| `GET` | `/products?limit=0` | Cargar el catálogo completo. |
| `GET` | `/products/{id}` | Consultar el detalle de un producto. |
| `POST` | `/products/add` | Enviar una nueva ficha de producto. |
| `PATCH` | `/products/{id}` | Enviar únicamente los campos modificados. |
| `PUT` | `/products/{id}` | Enviar los cinco campos del formulario. |
| `DELETE` | `/products/{id}` | Solicitar la eliminación tras confirmarla. |

El formulario utiliza **nombre, categoría, precio, existencias y descripción**. La búsqueda, los filtros, el ordenamiento y la paginación se procesan localmente después de cargar el catálogo.

Las solicitudes se centralizan en `request()`, que utiliza `fetch` con `async/await`, transforma los cuerpos a JSON, comprueba el estado HTTP y controla errores y tiempos de espera.

> **Un laboratorio, sin cambios permanentes.** DummyJSON simula las creaciones, actualizaciones y eliminaciones. Trama conserva el catálogo original y muestra el resultado en el registro de solicitudes. Un ID obtenido mediante POST no representa un producto guardado que luego pueda recuperarse con GET.

## 🧪 Un recorrido para probarlo

1. Busca un producto y abre su detalle: observa las solicitudes **GET**.
2. Pulsa **Crear producto**, completa la ficha y revisa la respuesta **POST**.
3. Abre un producto existente, elige **Editar · PATCH** y cambia solo el precio: comprueba que se envía únicamente ese campo.
4. Elige **Enviar ficha · PUT** y revisa los cinco campos enviados.
5. Selecciona **Eliminar · DELETE**, confirma y consulta la respuesta simulada.

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Formularios, estructura semántica y ventana modal con `dialog`. |
| CSS3 | Grid, Flexbox, variables de color y media queries. |
| JavaScript | Manipulación del DOM, eventos y operaciones sobre arreglos. |
| Fetch API | Comunicación HTTP con DummyJSON. |
| JSON | Intercambio de datos entre el portal y la API. |

## 📚 Referencia

[Documentación oficial de DummyJSON Products](https://dummyjson.com/docs/products)

---

<div align="center">

*Proyecto académico de consumo de APIs públicas.*

</div>
