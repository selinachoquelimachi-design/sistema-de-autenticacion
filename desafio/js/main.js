
// =============================================
// EXPRESIONES REGULARES (REGEX) - EXPLICACIÓN
// =============================================
const EXPRESIONES_REGULARES = {
    /**
     * VALIDACIÓN DE EMAIL:
     * - /^[a-zA-Z0-9._%+-]+@: Comienza con uno o más caracteres alfanuméricos, punto, guión, porcentaje o signo +
     * - [a-zA-Z0-9.-]+\.: Luego un dominio que puede contener letras, números, puntos o guiones
     * - [a-zA-Z]{2,}$/: Termina con extensión de al menos 2 letras
     * Ejemplo válido: usuario@dominio.com
     */
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

    /**
     * VALIDACIÓN DE NOMBRE:
     * - Solo letras (mayúsculas o minúsculas), incluyendo acentos y ñ
     * - Permite espacios entre nombres
     * - Mínimo 2 caracteres
     * Ejemplo válido: María José
     */
    nombre: /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,}$/,

    /**
     * VALIDACIÓN DE CONTRASEÑA SEGURA:
     * - (?=.*[a-z]): debe contener al menos una letra minúscula
     * - (?=.*[A-Z]): debe contener al menos una letra mayúscula
     * - (?=.*\d): debe contener al menos un número
     * - (?=.*[\W_]): debe contener al menos un carácter especial (no alfanumérico)
     * - .{6,}: mínimo 6 caracteres en total
     * Ejemplo válido: Contraseña123!
     */
    contraseña: /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[\W_]).{6,}$/,

    /**
     * VALIDACIÓN DE TELÉFONO BOLIVIANO:
     * - Solo números
     * - Exactamente 8 dígitos
     * Ejemplo válido: 71234567
     */
    telefono: /^[0-9]{8}$/
};

// =============================================
// ESTADO DEL SISTEMA
// =============================================
let intentosLogin = 3;         // Contador de intentos restantes
let cuentaBloqueada = false;   // Estado de bloqueo de la cuenta

// =============================================
// ELEMENTOS DEL DOM
// =============================================
const pantallas = document.querySelectorAll('.pantalla');
const mensajeSistema = document.getElementById('mensaje-sistema');

// =============================================
// MANEJO DE NAVEGACIÓN ENTRE PANTALLAS
// =============================================
document.getElementById('enlace-registrar').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-registro');
});

document.getElementById('enlace-iniciar-sesion').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-login');
});

document.getElementById('enlace-olvidaste').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-recuperacion');
});

document.getElementById('enlace-volver-login').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-login');
});

document.getElementById('enlace-recuperar-bloqueo').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-recuperacion');
});

// =============================================
// FUNCIÓN PARA MOSTRAR/OCULTAR CONTRASEÑA
// =============================================
document.querySelectorAll('.mostrar-contraseña').forEach(boton => {
    boton.addEventListener('click', function() {
        const campoContraseña = this.parentElement.querySelector('input');
        if (campoContraseña.type === 'password') {
            campoContraseña.type = 'text';
            this.textContent = '🔒';
        } else {
            campoContraseña.type = 'password';
            this.textContent = '👁';
        }
    });
});

// =============================================
// VALIDACIÓN DE TELÉFONO - SOLO NÚMEROS
// =============================================
document.getElementById('telefono').addEventListener('input', function(e) {
    // Eliminar cualquier caracter que no sea número
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Limitar a 8 dígitos (formato boliviano)
    if (this.value.length > 8) {
        this.value = this.value.slice(0, 8);
    }
});

// =============================================
// FUNCIÓN PARA MOSTRAR MENSAJES AL USUARIO
// =============================================
function mostrarMensaje(texto, tipo = 'info') {
    mensajeSistema.textContent = texto;
    mensajeSistema.className = tipo;
    mensajeSistema.classList.add('mostrar');
    setTimeout(() => mensajeSistema.classList.remove('mostrar'), 3000);
}

// =============================================
// FUNCIÓN PARA CAMBIAR ENTRE PANTALLAS
// =============================================
function mostrarPantalla(idPantalla) {
    pantallas.forEach(pantalla => pantalla.classList.remove('activa'));
    document.getElementById(idPantalla).classList.add('activa');
}

// =============================================
// ACTUALIZAR CONTADOR DE INTENTOS EN INTERFAZ
// =============================================
function actualizarIntentos() {
    document.getElementById('contador-intentos').textContent = intentosLogin;
}

// =============================================
// SISTEMA DE BLOQUEO POR INTENTOS FALLIDOS
// =============================================
/**
 * BLOQUEO DE CUENTA:
 * - Se activa después de 3 intentos fallidos
 * - Muestra pantalla especial de bloqueo
 * - Impide nuevos intentos de login
 * - Solo se desbloquea recuperando contraseña
 */
function bloquearCuenta() {
    cuentaBloqueada = true;
    mostrarPantalla('pantalla-bloqueada');
    localStorage.setItem('cuentaBloqueada', 'true'); // Guarda el estado en localStorage para mantenerlo tras recarga
}

function desbloquearCuenta() {
    cuentaBloqueada = false;
    intentosLogin = 3;            // Reinicia los intentos
    actualizarIntentos();          // Actualiza contador en la interfaz
    localStorage.removeItem('cuentaBloqueada'); // Limpia el estado de bloqueo
}

// =============================================
// MÓDULO DE INICIO DE SESIÓN
// =============================================
document.getElementById('formulario-login').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Verificar si la cuenta está bloqueada
    if (cuentaBloqueada) {
        mostrarMensaje('Cuenta bloqueada por intentos fallidos.', 'error');
        return;
    }
    
    const email = document.getElementById('email-login').value;
    const contraseña = document.getElementById('contraseña-login').value;
    
    // Validar formato de email
    if (!EXPRESIONES_REGULARES.email.test(email)) {
        mostrarMensaje('Ingrese un correo electrónico válido', 'error');
        return;
    }
    
    // Buscar usuario en almacenamiento local
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    // Verificar credenciales
    if (usuario && usuario.email === email && usuario.contraseña === contraseña) {
        // LOGIN CORRECTO
        mostrarMensaje(`Bienvenido al sistema, ${usuario.nombre}`, 'success');
        intentosLogin = 3; // Reinicia intentos después de login exitoso
        actualizarIntentos();
        e.target.reset();
    } else {
        // MANEJO DE INTENTOS FALLIDOS
        intentosLogin--;          // Disminuye el contador
        actualizarIntentos();     // Actualiza contador en interfaz
        mostrarMensaje('Usuario o contraseña incorrectos.', 'error');
        
        // Bloquear cuenta si se superan los intentos
        if (intentosLogin <= 0) {
            bloquearCuenta();
        }
    }
});

// =============================================
// MÓDULO DE REGISTRO DE USUARIO
// =============================================
document.getElementById('formulario-registro').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-completo').value;
    const email = document.getElementById('email-registro').value;
    const telefono = document.getElementById('telefono').value;
    const contraseña = document.getElementById('contraseña-registro').value;
    
    // VALIDACIONES CON EXPRESIONES REGULARES
    if (!EXPRESIONES_REGULARES.nombre.test(nombre)) {
        mostrarMensaje('El nombre solo puede contener letras y espacios', 'error');
        return;
    }
    
    if (!EXPRESIONES_REGULARES.email.test(email)) {
        mostrarMensaje('Ingrese un correo electrónico válido', 'error');
        return;
    }
    
    if (!EXPRESIONES_REGULARES.telefono.test(telefono)) {
        mostrarMensaje('El teléfono debe tener 8 dígitos', 'error');
        return;
    }
    
    /**
     * VALIDACIÓN DE CONTRASEÑA:
     * - Se verifica que cumpla con todos los requisitos de seguridad
     * - Regex asegura: mayúscula, minúscula, número y carácter especial
     * - Informa al usuario si no cumple
     */
    if (!EXPRESIONES_REGULARES.contraseña.test(contraseña)) {
        mostrarMensaje('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales', 'error');
        return;
    }
    
    // Guardar teléfono completo con código de país
    const telefonoCompleto = '+591' + telefono;
    
    // Crear y guardar usuario
    const usuario = { 
        nombre, 
        email, 
        telefono: telefonoCompleto, 
        contraseña 
    };
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    mostrarMensaje('¡Cuenta creada exitosamente!', 'success');
    e.target.reset();
    
    setTimeout(() => mostrarPantalla('pantalla-login'), 2000);
});

// =============================================
// MÓDULO DE RECUPERACIÓN DE CONTRASEÑA
// =============================================
document.getElementById('formulario-recuperacion').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email-recuperacion').value;
    const nuevaContraseña = document.getElementById('nueva-contraseña').value;
    
    // Validar email
    if (!EXPRESIONES_REGULARES.email.test(email)) {
        mostrarMensaje('Ingrese un correo electrónico válido', 'error');
        return;
    }
    
    /**
     * ACTUALIZACIÓN DE CONTRASEÑA:
     * - Se valida que la nueva contraseña cumpla los requisitos de seguridad
     * - Si el email coincide con un usuario registrado, se actualiza la contraseña
     * - Se desbloquea la cuenta automáticamente
     * - Se reinician los intentos de login
     * - Se informa al usuario del éxito
     */
    if (!EXPRESIONES_REGULARES.contraseña.test(nuevaContraseña)) {
        mostrarMensaje('La nueva contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales', 'error');
        return;
    }
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || usuario.email !== email) {
        mostrarMensaje('No se encontró una cuenta con ese correo electrónico', 'error');
        return;
    }
    
    usuario.contraseña = nuevaContraseña;
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    // Desbloquear cuenta y reiniciar intentos
    desbloquearCuenta();
    mostrarMensaje('Contraseña actualizada. Ahora puede iniciar sesión.', 'success');
    e.target.reset();
    
    setTimeout(() => mostrarPantalla('pantalla-login'), 2000);
});

// =============================================
// INICIALIZACIÓN DEL SISTEMA
// =============================================
function inicializarSistema() {
    // Verificar si hay cuenta bloqueada al cargar la página
    const bloqueada = localStorage.getItem('cuentaBloqueada');
    if (bloqueada === 'true') {
        cuentaBloqueada = true;
        mostrarPantalla('pantalla-bloqueada');
    }
    
    actualizarIntentos();
}

document.addEventListener('DOMContentLoaded', inicializarSistema);


