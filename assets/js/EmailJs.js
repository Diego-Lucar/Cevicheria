// Configuración de EmailJS
const EMAIL_CONFIG = {
    publicKey: 'H7RX8GQAuPuf-wjkC',
    serviceId: 'service_j2upbyy',
    templateId: 'template_4nqo6vy'
};

// Inicializar EmailJS
function initEmailService() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAIL_CONFIG.publicKey);
        console.log('EmailJS inicializado correctamente');
    } else {
        console.error('EmailJS no está cargado');
    }
}

// Formatear precio
function formatPrecio(n) {
    return `S/ ${n.toFixed(2)}`;
}


// Generar resumen en HTML para el correo
function generarResumenHTML(carrito, total) {
    const itemsHTML = carrito.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.nombre}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrecio(item.precio)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrecio(item.precio * item.cantidad)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a87); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🦐 Cevichería La Jama</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
                <h2 style="color: #1e3a5f;">¡Gracias por tu compra!</h2>
                <p>Hemos recibido tu pedido correctamente. Aquí está el resumen:</p>
                
                <table style="width: 95%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: #1e3a5f; color: white;">
                            <th style="padding: 12px; text-align: left;">Producto</th>
                            <th style="padding: 12px; text-align: center;">Cant.</th>
                            <th style="padding: 12px; text-align: right;">Precio</th>
                            <th style="padding: 12px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                    <tfoot>
                        <tr style="background: #e0f2fe;">
                            <td colspan="3" style="padding: 15px; font-weight: bold; text-align: right;">TOTAL:</td>
                            <td style="padding: 15px; font-weight: bold; text-align: right; font-size: 1.2em; color: #1e3a5f;">${formatPrecio(total)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="margin-top: 20px; padding: 15px; background: #fff; border-radius: 8px; border-left: 4px solid #1e3a5f;">
                    <p style="margin: 0; color: #666;">
                        <strong>📍 Dirección:</strong> Av. el Sol 456, Lima<br>
                        <strong>📞 Teléfono:</strong> +51 927 842 076<br>
                    </p>
                </div>
            </div>
            <div style="background: #1e3a5f; padding: 15px; text-align: center;">
                <p style="color: white; margin: 0; font-size: 0.9em;">© 2025 Cevichería La Jama | Todos los derechos reservados</p>
            </div>
        </div>
    `;
}

// Enviar correo de confirmación
async function enviarCorreoConfirmacion(email, nombreTitular, carrito, total) {
    const templateParams = {
        to_email: email,
        to_name: nombreTitular,
        order_date: new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        order_total: formatPrecio(total),
        // order_summary: generarResumenTexto(carrito, total),
        order_html: generarResumenHTML(carrito, total)
    };

    try {
        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templateId,
            templateParams
        );
        console.log('Correo enviado exitosamente:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return { success: false, error };
    }
}

// Exportar funciones para uso global
window.EmailService = {
    init: initEmailService,
    enviarConfirmacion: enviarCorreoConfirmacion
};