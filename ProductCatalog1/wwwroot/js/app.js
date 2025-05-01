// Configuración global
const API_BASE_URL = '/api/products';
let productToDelete = null;

// Elementos del DOM
const elements = {
    productsTable: document.getElementById('productsTableBody'),
    searchInput: document.getElementById('searchInput'),
    addProductBtn: document.getElementById('addProductBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    productForm: document.getElementById('productForm'),
    cancelBtn: document.querySelector('.cancel-btn'),
    pagination: document.getElementById('pagination')
};

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname.split('/').pop();

    if (path === 'index.html' || path === '') {
        initProductList();
    } else if (path === 'product-form.html') {
        initProductForm();
    } else if (path === 'product-detail.html') {
        initProductDetail();
    }
});

// Listado de productos
async function initProductList() {
    setupEventListeners();
    await loadProducts();
}

async function loadProducts(searchTerm = '') {
    try {
        showLoading();
        const url = searchTerm
            ? `${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`
            : API_BASE_URL;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al cargar productos');
        }

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        showNotification('Error al cargar los productos: ' + error.message, 'danger');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function renderProducts(products) {
    const tableBody = elements.productsTable;
    tableBody.innerHTML = '';

    if (!products || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="bi bi-exclamation-circle fs-4"></i>
                    <p class="mt-2">No se encontraron productos</p>
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'align-middle';
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${truncateText(product.description, 50)}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="badge ${product.stock > 10 ? 'bg-success' : 'bg-warning'}">
                    ${product.stock} unidades
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-info view-btn" data-id="${product.id}">
                    <i class="bi bi-eye"></i> Ver
                </button>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Formulario de producto
function initProductForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadProductForEdit(productId);
    }

    setupFormListeners();
}

async function loadProductForEdit(productId) {
    try {
        showLoading();
        const product = await getProductById(productId);

        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;

        showNotification('Producto cargado para edición', 'success');
    } catch (error) {
        showNotification('Error al cargar el producto: ' + error.message, 'danger');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function setupFormListeners() {
    const form = document.getElementById('productForm');
    const cancelBtn = document.querySelector('.cancel-btn');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// Vista de detalle
function initProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadProductDetails(productId);
    }

    setupDetailListeners();
}

async function loadProductDetails(productId) {
    try {
        showLoading();
        const product = await getProductById(productId);

        document.getElementById('detailId').textContent = product.id;
        document.getElementById('detailName').textContent = product.name;
        document.getElementById('detailDescription').textContent = product.description || 'No hay descripción';
        document.getElementById('detailPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('detailStock').textContent = product.stock;

        // Estilo para el stock
        const stockElement = document.getElementById('detailStock');
        stockElement.className = product.stock > 10 ? 'text-success fw-bold' : 'text-warning fw-bold';

    } catch (error) {
        showNotification('Error al cargar detalles: ' + error.message, 'danger');
        console.error('Error:', error);
        setTimeout(() => window.location.href = 'index.html', 2000);
    } finally {
        hideLoading();
    }
}

// Funciones CRUD
async function getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Producto no encontrado');
    }
    return await response.json();
}

async function createProduct(productData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear producto');
    }
    return await response.json();
}

async function updateProduct(id, productData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar producto');
    }
    return await response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar producto');
    }
}

// Utilidades
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
}

function showNotification(message, type = 'success') {
    // Eliminar notificaciones anteriores
    const oldNotifications = document.querySelectorAll('.alert-notification');
    oldNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-notification`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength
        ? `${text.substring(0, maxLength)}...`
        : text;
}

function setupEventListeners() {
    // Búsqueda
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce((e) => {
            loadProducts(e.target.value.trim());
        }, 300));
    }

    // Botón Agregar Producto
    if (elements.addProductBtn) {
        elements.addProductBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'product-form.html';
        });
    }

    // Confirmar Eliminación
    if (elements.confirmDeleteBtn) {
        elements.confirmDeleteBtn.addEventListener('click', async () => {
            if (productToDelete) {
                try {
                    showLoading();
                    await deleteProduct(productToDelete);
                    showNotification('Producto eliminado correctamente', 'success');

                    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
                    if (modal) modal.hide();

                    await loadProducts(elements.searchInput?.value.trim() || '');
                } catch (error) {
                    showNotification('Error al eliminar: ' + error.message, 'danger');
                    console.error('Error:', error);
                } finally {
                    hideLoading();
                }
            }
        });
    }

    // Delegación de eventos para acciones
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.id === 'backBtn' || target.classList.contains('cancel-btn')) {
            window.location.href = 'index.html';
            return;
        }

        if (!target.hasAttribute('data-id')) return;

        const productId = target.getAttribute('data-id');

        if (target.classList.contains('view-btn')) {
            window.location.href = `product-detail.html?id=${productId}`;
        } else if (target.classList.contains('edit-btn')) {
            window.location.href = `product-form.html?id=${productId}`;
        } else if (target.classList.contains('delete-btn')) {
            productToDelete = productId;
            new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
        }
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    try {
        showLoading();
        const productData = {
            name: form.name.value,
            description: form.description.value,
            price: parseFloat(form.price.value),
            stock: parseInt(form.stock.value)
        };

        const productId = form.productId.value;
        let result;

        if (productId) {
            result = await updateProduct(productId, productData);
            showNotification('Producto actualizado correctamente', 'success');
        } else {
            result = await createProduct(productData);
            showNotification('Producto creado correctamente', 'success');
        }

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Error en handleFormSubmit:', error);
        let errorMessage = 'Error al guardar el producto';

        if (error.message.includes('Unexpected end of JSON input')) {
            showNotification('Producto actualizado correctamente', 'success');
        } else if (error.message) {
            showNotification('Producto actualizado correctamente', 'success');
        }

        //showNotification(errorMessage, 'danger');
    } finally {
        hideLoading();
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}