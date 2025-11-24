document.addEventListener('DOMContentLoaded', () => {
    // ==================== FUNCIONES UTILITARIAS ====================
    function parsePrice(text) {
        return parseFloat(String(text).replace(/[^\d.]/g, '')) || 0;
    }
    
    function formatPrice(n) {
        return `S/ ${n.toFixed(2)}`;
    }

    // ==================== CARRITO DE COMPRAS ====================
    let carrito = [];
    let totalCarrito = 0;

    const carritoBtn = document.getElementById('carritoBtn');
    const carritoOverlay = document.getElementById('carrito-overlay');
    const carritoClose = document.querySelector('.carrito-close');
    const carritoItems = document.getElementById('carrito-items');
    const carritoCount = document.querySelector('.carrito-count');
    const totalPrecio = document.querySelector('.total-precio');
    const precioCarrito = document.querySelector('.precio-carrito');
    const btnProceder = document.getElementById('btn-proceder');

    function actualizarCarrito() {
        // Actualizar contador y precio en el botón
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        carritoCount.textContent = `(${totalItems})`;
        precioCarrito.textContent = formatPrice(totalCarrito);

        // Actualizar total en el footer
        totalPrecio.textContent = formatPrice(totalCarrito);

        // Habilitar/deshabilitar botón de proceder
        btnProceder.disabled = carrito.length === 0;

        // Mostrar items o mensaje vacío
        if (carrito.length === 0) {
            carritoItems.innerHTML = `
                <div class="carrito-empty">
                    <ion-icon name="bag-outline"></ion-icon>
                    <p>Tu carrito está vacío</p>
                </div>`;
        } else {
            carritoItems.innerHTML = carrito.map(item => `
                <div class="carrito-item" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.nombre}" class="item-img">
                    <div class="item-info">
                        <div class="item-name">${item.nombre}</div>
                        <div class="item-price">${formatPrice(item.precio * item.cantidad)}</div>
                        <div class="item-controls">
                            <div class="item-qty">
                                <button class="qty-btn qty-dec" ${item.cantidad <= 1 ? 'disabled' : ''}>−</button>
                                <span class="qty-number">${item.cantidad}</span>
                                <button class="qty-btn qty-inc">+</button>
                            </div>
                            <button class="item-remove" title="Eliminar">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function agregarAlCarrito(producto) {
        const existe = carrito.find(item => item.nombre === producto.nombre);
        
        if (existe) {
            existe.cantidad += producto.cantidad;
        } else {
            carrito.push({
                id: Date.now() + Math.random(),
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: producto.cantidad,
                img: producto.img
            });
        }
        
        totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        actualizarCarrito();
    }

    function modificarCantidad(id, cambio) {
        const item = carrito.find(item => item.id == id);
        if (!item) return;

        item.cantidad += cambio;
        
        if (item.cantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            actualizarCarrito();
        }
    }

    function eliminarDelCarrito(id) {
        carrito = carrito.filter(item => item.id != id);
        totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        actualizarCarrito();
    }


    // ==================== OVERLAY DE PRODUCTOS ====================
    function ensureSectionOverlay(section) {
        let overlay = section.querySelector('.section-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'section-overlay';
            overlay.hidden = true;
            overlay.innerHTML = `
            <div class="contenedor-overlay" role="dialog" aria-modal="true">
                <div class="header">
                    <h2></h2>
                    <button class="close" aria-label="Cerrar">×</button>
                </div>
                <div class="body">
                    <img src="" alt="">
                    <p></p>
                </div>
                <div class="footer">
                    <div class="btns-update">
                        <button class="disminuir" type="button">-</button>
                        <input class="cantidad" type="number" value="1" min="1" max="10">
                        <button class="incrementar" type="button">+</button>
                    </div>
                    <button class="add">Agregar <span class="total"></span></button>
                </div>
            </div>`;
            section.appendChild(overlay);

            // Cerrar overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeOverlay(section);
                if (e.target.closest('.close')) closeOverlay(section);
            });

            overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !overlay.hidden) closeOverlay(section);
            });

            // Controles de cantidad
            const disminuir = overlay.querySelector('.disminuir');
            const incrementar = overlay.querySelector('.incrementar');
            const cantidad = overlay.querySelector('.cantidad');

            incrementar.addEventListener('click', () => {
                const max = +cantidad.max || 999;
                cantidad.value = Math.min(max, (+cantidad.value || 1) + 1);
                updateTotal(section);
            });
            
            disminuir.addEventListener('click', () => {
                const min = +cantidad.min || 1;
                cantidad.value = Math.max(min, (+cantidad.value || 1) - 1);
                updateTotal(section);
            });
            
            cantidad.addEventListener('input', () => {
                const min = +cantidad.min || 1;
                const max = +cantidad.max || 999;
                cantidad.value = Math.max(min, Math.min(max, +cantidad.value || min));
                updateTotal(section);
            });

            // BOTÓN AGREGAR - AQUÍ ESTÁ LA INTEGRACIÓN CON EL CARRITO
            overlay.querySelector('.add').addEventListener('click', () => {
                const title = overlay.querySelector('.header h2').textContent;
                const qty = +overlay.querySelector('.cantidad').value || 1;
                const unitPrice = parseFloat(overlay.dataset.unitPrice || '0');
                const img = overlay.querySelector('.body img').src;
                
                // Agregar al carrito
                agregarAlCarrito({
                    nombre: title,
                    precio: unitPrice,
                    cantidad: qty,
                    img: img
                });
                
                closeOverlay(section);
            });
        }
        return overlay;
    }

    function openOverlay(section, { img, title, desc, price }) {
        const overlay = ensureSectionOverlay(section);
        overlay.hidden = false;
        section.classList.add('is-overlaying');

        const cont = overlay.querySelector('.contenedor-overlay');
        cont.querySelector('.header h2').textContent = title || '';
        cont.querySelector('.body img').src = img || '';
        cont.querySelector('.body img').alt = title || '';
        cont.querySelector('.body p').textContent = desc || '';
        overlay.dataset.unitPrice = String(parsePrice(price) || 0);

        const cantidad = cont.querySelector('.cantidad');
        cantidad.value = 1;
        updateTotal(section);

        cont.querySelector('.add').focus();
    }

    function updateTotal(section) {
        const overlay = section.querySelector('.section-overlay');
        if (!overlay) return;
        const unit = parseFloat(overlay.dataset.unitPrice || '0');
        const qty = +overlay.querySelector('.cantidad').value || 1;
        overlay.querySelector('.total').textContent = formatPrice(unit * qty);
    }

    function closeOverlay(section) {
        const overlay = section.querySelector('.section-overlay');
        if (!overlay) return;
        overlay.hidden = true;
        section.classList.remove('is-overlaying');
    }

    // ==================== EVENT LISTENERS ====================
    
    // Abrir overlay de productos
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.agregar');
        const card = e.target.closest('.contenedor');
        if (!btn || !card) return;

        const section = e.target.closest('.menu-section');
        openOverlay(section, {
            img: card.querySelector('.img')?.src,
            title: card.querySelector('.info h2')?.textContent?.trim() || 'Producto',
            desc: card.querySelector('.info p')?.textContent?.trim() || '',
            price: card.querySelector('.precio p')?.textContent?.trim() || 'S/ 0.00'
        });
    });

    // Event listeners del carrito
    carritoBtn.addEventListener('click', () => {
        carritoOverlay.hidden = false;
    });

    carritoClose.addEventListener('click', () => {
        carritoOverlay.hidden = true;
    });

    carritoOverlay.addEventListener('click', (e) => {
        if (e.target === carritoOverlay) {
            carritoOverlay.hidden = true;
        }
    });

    carritoItems.addEventListener('click', (e) => {
        const item = e.target.closest('.carrito-item');
        if (!item) return;
        
        const id = item.dataset.id;
        
        if (e.target.closest('.qty-inc')) {
            modificarCantidad(id, 1);
        } else if (e.target.closest('.qty-dec')) {
            modificarCantidad(id, -1);
        } else if (e.target.closest('.item-remove')) {
            eliminarDelCarrito(id);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !carritoOverlay.hidden) {
            carritoOverlay.hidden = true;
        }
    });

    // Inicializar carrito vacío
    actualizarCarrito();
});