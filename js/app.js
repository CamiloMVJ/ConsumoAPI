'use strict';

// Configuración general
const API_URL = 'https://dummyjson.com';
const PAGE_SIZE = 12;

const $ = (selector) => document.querySelector(selector);

const state = {
    products: [],
    filtered: [],
    page: 1,
    selected: null,
    method: 'POST',
    busy: false
};

const money = new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'USD'
});

let toastTimer;

// Crear elementos sin interpretar los datos como HTML.
function element(tag, className, text) {
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;

    return node;
}

// Mostrar notificaciones.
function notify(message, error = false) {
    clearTimeout(toastTimer);

    $('#toast').textContent = message;
    $('#toast').className = `toast${error ? ' error-toast' : ''}`;
    $('#toast').hidden = false;

    toastTimer = setTimeout(() => {
        $('#toast').hidden = true;
    }, 6500);
}

// Registrar las solicitudes y respuestas.
function logRequest(
    method,
    path,
    payload,
    response,
    status,
    elapsed,
    failed
) {
    const log = $('#request-log');

    if (!log.querySelector('details')) {
        log.replaceChildren();
    }

    const entry = element(
        'details',
        `log-entry${failed ? ' failed' : ''}`
    );

    const summary = element('summary');

    summary.append(
        element('span', 'method', method),
        document.createTextNode(
            `${path} · ${status} · ${elapsed} ms`
        )
    );

    const body = element('div', 'log-body');

    body.append(
        element('h3', '', 'URL'),
        element('pre', '', API_URL + path),
        element('h3', '', 'Cuerpo enviado'),
        element(
            'pre',
            '',
            payload ? JSON.stringify(payload, null, 2) : 'Sin cuerpo.'
        ),
        element('h3', '', 'Respuesta'),
        element('pre', '', JSON.stringify(response, null, 2))
    );

    entry.append(summary, body);
    log.prepend(entry);

    // Conservar las últimas 10 solicitudes.
    while (log.children.length > 10) {
        log.lastElementChild.remove();
    }
}

// Función compartida para GET, POST, PATCH, PUT y DELETE.
async function request(path, method = 'GET', payload) {
    const started = performance.now();
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 20000);

    let status = 'Sin respuesta';
    let data;

    try {
        const options = {
            method,
            signal: controller.signal
        };

        if (payload !== undefined) {
            options.headers = {
                'Content-Type': 'application/json'
            };

            options.body = JSON.stringify(payload);
        }

        const response = await fetch(API_URL + path, options);

        status = response.status;

        const raw = await response.text();

        try {
            data = JSON.parse(raw);
        } catch {
            data = {
                message: raw || 'Respuesta vacía'
            };
        }

        if (!response.ok) {
            throw new Error(
                data.message || `Error HTTP ${response.status}`
            );
        }

        logRequest(
            method,
            path,
            payload,
            data,
            status,
            Math.round(performance.now() - started),
            false
        );

        return data;
    } catch (error) {
        let message = error.message;

        if (error.name === 'AbortError') {
            message = 'La API tardó demasiado. Vuelve a intentarlo.';
        } else if (error instanceof TypeError) {
            message =
                'No se pudo conectar con DummyJSON. Revisa tu conexión.';
        }

        logRequest(
            method,
            path,
            payload,
            data || { message },
            status,
            Math.round(performance.now() - started),
            true
        );

        throw new Error(message);
    } finally {
        clearTimeout(timeout);
    }
}

// Crear la imagen de un producto.
function productImage(product, className) {
    const img = element('img', className);

    img.alt = product.title || 'Producto';
    img.loading = 'lazy';

    const source = product.thumbnail || product.images?.[0];

    if (source && /^https?:\/\//i.test(source)) {
        img.src = source;
    }

    img.addEventListener('error', () => {
        img.hidden = true;
    });

    return img;
}

// Crear botones con una acción.
function actionButton(label, style, callback) {
    const button = element(
        'button',
        `button ${style}`,
        label
    );

    button.type = 'button';
    button.addEventListener('click', callback);

    return button;
}

// Búsqueda, categoría y ordenamiento locales.
function applyFilters(resetPage = true) {
    const term = $('#search').value.trim().toLocaleLowerCase();
    const category = $('#category').value;

    state.filtered = state.products.filter((product) => {
        const matchesSearch =
            !term ||
            product.title.toLocaleLowerCase().includes(term);

        const matchesCategory =
            !category || product.category === category;

        return matchesSearch && matchesCategory;
    });

    state.filtered.sort((a, b) => {
        if ($('#sort').value === 'price') {
            return a.price - b.price;
        }

        return a.title.localeCompare(b.title);
    });

    if (resetPage) {
        state.page = 1;
    }

    renderProducts();
}

// Dibujar las tarjetas de productos.
function renderProducts() {
    const grid = $('#products');

    grid.replaceChildren();

    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    state.page = Math.min(state.page, pages);

    const start = (state.page - 1) * PAGE_SIZE;
    const visible = state.filtered.slice(start, start + PAGE_SIZE);

    $('#total-count').textContent = total;

    $('#status').textContent = total
        ? `Mostrando ${start + 1}–${start + visible.length} de ${total} productos · Precios en USD`
        : 'No hay coincidencias para esta búsqueda.';

    $('#page-info').textContent =
        `Página ${state.page} de ${pages}`;

    $('#previous').disabled = state.page <= 1;
    $('#next').disabled = state.page >= pages;

    if (!total) {
        grid.append(
            element(
                'div',
                'empty-state',
                'Prueba otro nombre o selecciona otra categoría.'
            )
        );
    }

    visible.forEach((product) => {
        const card = element('article', 'card');
        const picture = element('div', 'product-image');

        picture.append(
            productImage(product),
            element(
                'span',
                'product-id',
                `N.º ${String(product.id).padStart(3, '0')}`
            )
        );

        const content = element('div', 'card-content');

        content.append(
            element(
                'p',
                'category-tag',
                product.category.replaceAll('-', ' ')
            ),
            element('h3', '', product.title)
        );

        const priceRow = element('div', 'price-row');

        priceRow.append(
            element('span', 'price', money.format(product.price)),
            element(
                'span',
                'stock',
                `${product.stock} disponibles`
            )
        );

        const button = actionButton(
            'Explorar producto',
            '',
            () => showDetails(product.id)
        );

        button.className = 'card-button';
        button.append(element('span', '', '↗'));

        button.setAttribute(
            'aria-label',
            `Ver detalle de ${product.title}`
        );

        content.append(priceRow, button);
        card.append(picture, content);
        grid.append(card);
    });
}

// GET: cargar el catálogo.
async function loadProducts() {
    $('#refresh-button').disabled = true;
    $('#products').setAttribute('aria-busy', 'true');
    $('#status').textContent = 'Consultando productos en DummyJSON…';

    try {
        // limit=0 permite obtener todos los productos.
        const data = await request('/products?limit=0');

        if (!Array.isArray(data.products)) {
            throw new Error(
                'La API no devolvió una lista de productos válida.'
            );
        }

        state.products = data.products;

        const currentCategory = $('#category').value;

        $('#category').replaceChildren(
            new Option('Todas las categorías', '')
        );
        const categorySelect = $('#product-category');

        const placeholder = new Option(
            'Selecciona una categoría',
            '',
            true,
            true
        );

        placeholder.disabled = true;

        categorySelect.replaceChildren(placeholder);

        const categories = [
            ...new Set(data.products.map((product) => product.category))
        ].sort();

        categories.forEach((category) => {
            $('#category').add(
                new Option(category.replaceAll('-', ' '), category)
            );

            const categoryName = category
                .replaceAll('-', ' ')
                .replace(/^./, (letter) => letter.toUpperCase());

            $('#product-category').add(
                new Option(categoryName, category)
            );
        });

        $('#category').value = currentCategory;

        applyFilters();
    } catch (error) {
        $('#status').textContent = error.message;

        if (!state.products.length) {
            $('#products').replaceChildren(
                element(
                    'div',
                    'empty-state',
                    'No se pudo cargar el catálogo. Pulsa Actualizar para reintentar.'
                )
            );
        }

        notify(error.message, true);
    } finally {
        $('#products').setAttribute('aria-busy', 'false');
        $('#refresh-button').disabled = false;
    }
}

// Preparar y abrir la ventana modal.
function openDialog(title, kicker) {
    $('#dialog-title').textContent = title;
    $('#dialog-kicker').textContent = kicker;

    $('#detail-view').hidden = true;
    $('#product-form').hidden = true;
    $('#delete-view').hidden = true;

    $('#form-error').textContent = '';

    if (!$('#product-dialog').open) {
        $('#product-dialog').showModal();
    }
}

// Evitar envíos duplicados mientras una solicitud está en curso.
function setBusy(busy) {
    state.busy = busy;

    $('#product-dialog')
        .querySelectorAll('button, input, textarea, select')
        .forEach((control) => {
            control.disabled = busy;
        });
}

// GET: consultar un producto por su ID.
async function showDetails(id) {
    openDialog(
        'Consultando producto…',
        `GET /products/${id}`
    );

    setBusy(true);

    try {
        state.selected = await request(`/products/${id}`);
        renderDetails();
    } catch (error) {
        $('#product-dialog').close();
        notify(error.message, true);
    } finally {
        setBusy(false);
    }
}

// Mostrar detalle y acciones disponibles.
function renderDetails() {
    const product = state.selected;

    openDialog(
        product.title,
        `PRODUCTO N.º ${product.id}`
    );

    const detail = $('#detail-view');

    detail.hidden = false;

    detail.replaceChildren(
        productImage(product, 'detail-image')
    );

    const meta = element('div', 'detail-meta');

    meta.append(
        element('span', 'price', money.format(product.price)),
        element(
            'span',
            'stock',
            `${product.stock} disponibles · ${product.category}`
        )
    );

    detail.append(
        meta,
        element('p', 'muted', product.description)
    );

    const actions = element('div', 'detail-actions');

    actions.append(
        actionButton(
            'Editar · PATCH',
            'primary',
            () => showForm('PATCH')
        ),
        actionButton(
            'Enviar ficha · PUT',
            'outline',
            () => showForm('PUT')
        ),
        actionButton(
            'Eliminar · DELETE',
            'outline',
            showDelete
        )
    );

    detail.append(actions);
}

// Preparar formulario para POST, PATCH o PUT.
function showForm(method) {
    state.method = method;

    const creating = method === 'POST';

    const path = creating
        ? '/products/add'
        : `/products/${state.selected.id}`;

    openDialog(
        creating ? 'Un nuevo producto' : 'Editar producto',
        `${method} ${path}`
    );

    $('#product-form').hidden = false;
    $('#product-form').reset();

    if (creating) {
        $('#form-help').textContent =
            'Completa la ficha. La API devolverá una creación simulada con un ID nuevo.';
    } else if (method === 'PATCH') {
        $('#form-help').textContent =
            'Solo se enviarán los campos que modifiques respecto a la ficha original.';
    } else {
        $('#form-help').textContent =
            'Se enviarán los cinco campos de este formulario. DummyJSON simula la actualización mediante PUT.';
    }

    if (!creating) {
        const fields = [
            'title',
            'category',
            'price',
            'stock',
            'description'
        ];

        fields.forEach((key) => {
            $(`#product-${key}`).value = state.selected[key] ?? '';
        });
    }

    $('#save-button').textContent = `Enviar ${method}`;
    $('#product-title').focus();
}

// POST, PATCH y PUT: enviar el formulario.
async function saveProduct(event) {
    event.preventDefault();

    if (state.busy || !$('#product-form').reportValidity()) {
        return;
    }

    const fields = {
        title: $('#product-title').value.trim(),
        category: $('#product-category').value.trim(),
        price: Number($('#product-price').value),
        stock: Number($('#product-stock').value),
        description: $('#product-description').value.trim()
    };

    if (!fields.title || !fields.category || !fields.description) {
        $('#form-error').textContent =
            'El nombre, la categoría y la descripción no pueden estar vacíos.';

        return;
    }

    let payload = fields;

    // PATCH envía solamente los campos modificados.
    if (state.method === 'PATCH') {
        payload = Object.fromEntries(
            Object.entries(fields).filter(([key, value]) => {
                return value !== state.selected[key];
            })
        );

        if (!Object.keys(payload).length) {
            $('#form-error').textContent =
                'Modifica al menos un campo para enviar PATCH.';

            return;
        }
    }

    setBusy(true);
    $('#form-error').textContent = '';

    const originalLabel = $('#save-button').textContent;
    $('#save-button').textContent = 'Enviando…';

    try {
        const path = state.method === 'POST'
            ? '/products/add'
            : `/products/${state.selected.id}`;

        const result = await request(
            path,
            state.method,
            payload
        );

        $('#product-dialog').close();

        notify(
            `${state.method} correcto · Producto #${result.id}. Simulación completada; revisa el registro.`
        );

        /*
          DummyJSON no guarda estas modificaciones.
    
          Conservamos el catálogo original y mostramos la respuesta
          en el registro. Un producto creado de forma simulada no
          se puede consultar después con GET usando su nuevo ID.
        */
    } catch (error) {
        $('#form-error').textContent = error.message;
    } finally {
        setBusy(false);
        $('#save-button').textContent = originalLabel;
    }
}

// Mostrar confirmación antes de DELETE.
function showDelete() {
    openDialog(
        `¿Eliminar “${state.selected.title}”?`,
        `DELETE /products/${state.selected.id}`
    );

    $('#delete-view').hidden = false;
}

// DELETE: eliminar un producto de forma simulada.
async function deleteProduct() {
    if (state.busy) return;

    setBusy(true);

    try {
        const result = await request(
            `/products/${state.selected.id}`,
            'DELETE'
        );

        $('#product-dialog').close();

        notify(
            `DELETE correcto · Producto #${result.id}. Eliminación simulada; el catálogo remoto se conserva.`
        );
    } catch (error) {
        notify(error.message, true);
    } finally {
        setBusy(false);
    }
}

// Eventos de búsqueda y filtros.
$('#search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
});

$('#search').addEventListener('input', () => {
    applyFilters();
});

$('#category').addEventListener('change', () => {
    applyFilters();
});

$('#sort').addEventListener('change', () => {
    applyFilters();
});

// Eventos del catálogo.
$('#refresh-button').addEventListener('click', loadProducts);

$('#create-button').addEventListener('click', () => {
    showForm('POST');
});

$('#previous').addEventListener('click', () => {
    state.page--;
    renderProducts();
});

$('#next').addEventListener('click', () => {
    state.page++;
    renderProducts();
});

// Eventos del formulario y la ventana modal.
$('#product-form').addEventListener('submit', saveProduct);

$('#close-dialog').addEventListener('click', () => {
    $('#product-dialog').close();
});

$('#cancel-form').addEventListener('click', () => {
    if (state.method === 'POST') {
        $('#product-dialog').close();
    } else {
        renderDetails();
    }
});

$('#cancel-delete').addEventListener('click', renderDetails);

$('#confirm-delete').addEventListener('click', deleteProduct);

// Impedir cerrar con Escape mientras se procesa una solicitud.
$('#product-dialog').addEventListener('cancel', (event) => {
    if (state.busy) {
        event.preventDefault();
    }
});

// Cargar los productos al abrir la página.
loadProducts();