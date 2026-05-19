let carrito = [];
let carritoExpanded = false; // control para expandir/plegar la lista en el modal

// Persistencia en localStorage
function saveCarrito(){
  try { localStorage.setItem('xamaran_carrito', JSON.stringify(carrito)); } catch(e){}
}

function loadCarrito(){
  try{
    const raw = localStorage.getItem('xamaran_carrito');
    if (raw){ const parsed = JSON.parse(raw); if (Array.isArray(parsed)) carrito = parsed; }
  }catch(e){}
}

function toggleListaCarrito(){
  carritoExpanded = !carritoExpanded;
  actualizarInterfazCarrito();
}

// 1. Función para añadir al carrito (mantiene cantidad por producto)
function añadirAlCarrito(nombre, precio) {
  precio = parseFloat(precio);
  const existente = carrito.find(it => it.nombre === nombre);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }
  actualizarInterfazCarrito();
}

// Eliminar un producto entero del carrito por nombre
function eliminarDelCarrito(nombre){
  const idx = carrito.findIndex(it => it.nombre === nombre);
  if (idx === -1) return;
  carrito.splice(idx, 1);
  saveCarrito();
  actualizarInterfazCarrito();
}

// 2. Función para actualizar los números de la cabecera y el modal
function actualizarInterfazCarrito() {
  const cantidadTotal = carrito.reduce((s, it) => s + it.cantidad, 0);
  const precioTotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const elCantidad = document.getElementById('carrito-cantidad');
  const elTotal = document.getElementById('carrito-total');
  if (elCantidad) elCantidad.innerText = `${cantidadTotal} productos`;
  if (elTotal) elTotal.innerText = `${precioTotal.toFixed(2)} €`;
  
  // Actualizar la lista visual dentro del modal con nombre, cantidad, subtotal
  const lista = document.getElementById('lista-carrito');
  const summaryEl = document.getElementById('carrito-summary');
  if (lista) {
    lista.innerHTML = '';
    const itemsToRender = carritoExpanded ? carrito : [];
    itemsToRender.forEach(item => {
      const li = document.createElement('li');
      const subtotal = (item.precio * item.cantidad).toFixed(2);
      li.innerHTML = `
        <div class="lista-info">
          <span class="lista-nombre">${item.nombre}</span>
          <span class="lista-cantidad">Cantidad: ${item.cantidad}</span>
        </div>
        <span class="lista-subtotal">${subtotal} €</span>
      `;
      // botón eliminar
      const btn = document.createElement('button');
      btn.className = 'btn-eliminar';
      btn.type = 'button';
      btn.textContent = 'Eliminar';
      btn.addEventListener('click', function(e){ e.stopPropagation(); eliminarDelCarrito(item.nombre); });
      li.appendChild(btn);
      lista.appendChild(li);
    });
    // Mostrar u ocultar la lista completa; el summary contiene el toggle y resumen compacto
    if (!summaryEl) {
      // fallback: always show list
      lista.style.display = '';
    } else {
      if (carrito.length === 0) {
        summaryEl.innerText = 'Carrito vacío';
        lista.style.display = 'none';
      } else if (!carritoExpanded) {
        const visibles = 0; // when collapsed we hide items entirely
        summaryEl.innerHTML = `<span>${cantidadTotal} productos — ${precioTotal.toFixed(2)} €</span> <button class="btn-toggle" onclick="toggleListaCarrito()">Mostrar ${carrito.length - visibles} productos</button>`;
        lista.style.display = 'none';
      } else {
        summaryEl.innerHTML = `<button class="btn-toggle" onclick="toggleListaCarrito()">Ocultar lista</button>`;
        lista.style.display = '';
      }
    }
  }
  const modalTotal = document.getElementById('modal-total');
  if (modalTotal) modalTotal.innerText = `${precioTotal.toFixed(2)} €`;
  // persistir cambios
  saveCarrito();
}

// 3. Modifica tu función renderizarProductos existente:
function renderizarProductos(productosParaMostrar) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = ''; 

  productosParaMostrar.forEach(producto => {
    const desc = producto.Descripcion || ""; 
    const precioNum = Number(producto.precio);
    const precioFormateado = precioNum.toFixed(2);

    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `
      <img src="${producto.imagen || 'img/placeholder.png'}" alt="${producto.nombre}" style="width:100%; max-height: 200px; object-fit: contain;">
      <h3>${producto.nombre}</h3>
      <p class="descripcion">${desc}</p>
      <p class="precio"><strong>${precioFormateado} €</strong></p>
      <button class="btn-seleccionar" onclick="añadirAlCarrito('${producto.nombre}', ${precioNum})">Seleccionar</button>
    `;
    contenedorProductos.appendChild(card);
  });
}

// 4. Lógica para abrir/cerrar el listado (Modal) — registrar al cargar el DOM
document.addEventListener('DOMContentLoaded', function(){
  // cargar carrito desde localStorage antes de usarlo
  loadCarrito();
  // asegurarse de que el estado inicial del desplegable esté en collapsed
  carritoExpanded = false;
  actualizarInterfazCarrito();
  const modal = document.getElementById('carrito-modal');
  const abrir = document.getElementById('abrir-carrito');
  const cerrar = document.querySelector('.cerrar-modal');
  if (abrir && modal) {
    abrir.addEventListener('click', function(e){
      e.stopPropagation();
      modal.style.display = 'block';
      actualizarInterfazCarrito();
    });
  }
  if (cerrar && modal) {
    cerrar.addEventListener('click', function(){ modal.style.display = 'none'; });
  }
  window.addEventListener('click', function(event){ if (event.target === modal) modal.style.display = 'none'; });
});

// 5. Finalizar compra: confirmar, enviar email vía EmailJS y notificar al usuario
function finalizarCompra(){
  if (!carrito || carrito.length === 0) {
    alert('El carrito está vacío. Añade productos antes de finalizar.');
    return;
  }
  
  // Recoger datos del formulario
  const nameEl = document.getElementById('cliente-nombre');
  const emailEl = document.getElementById('cliente-email');
  const tlfEl = document.getElementById('cliente-telefono');
  const obsEl = document.getElementById('cliente-observaciones');

  const clienteNombre = nameEl ? nameEl.value.trim() : '';
  const clienteEmail = emailEl ? emailEl.value.trim() : '';
  const clienteTelefono = tlfEl ? tlfEl.value.trim() : '';
  const clienteObservaciones = obsEl ? obsEl.value.trim() : 'Ninguna';

  // 1. VALIDACIÓN: El nombre siempre es obligatorio
  if (!clienteNombre) { 
    alert('Introduce tu nombre.'); 
    if(nameEl) nameEl.focus(); 
    return; 
  }
  
  // Expresión regular para validar el correo
  const emailRegex = /^\S+@\S+\.\S+$/;
  
  // Comprobamos si los campos individuales son válidos de forma independiente
  const esEmailValido = clienteEmail && emailRegex.test(clienteEmail);
  const esTelefonoValido = clienteTelefono && clienteTelefono.length >= 9;

  // 2. VALIDACIÓN CONDICIONAL: Debe haber al menos un método de contacto válido
  if (!esEmailValido && !esTelefonoValido) {
    alert('Por favor, introduce al menos un método de contacto válido (un Correo electrónico correcto o un Número de teléfono de mínimo 9 dígitos).');
    
    // Enfocamos el email por defecto para ayudar al usuario
    if (emailEl) emailEl.focus(); 
    return; 
  }

  // Si pasa el filtro anterior, procedemos con la confirmación
  if (!confirm('¿Deseas enviar el pedido a la tienda?')) return;

  const precioTotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2);
  const itemsPlain = carrito.map(it => `${it.nombre} x${it.cantidad} — ${(it.precio * it.cantidad).toFixed(2)} €`).join('\n');

  // Si alguno de los campos no es válido pero el otro sí (por ejemplo, dejaron el email vacío pero pusieron teléfono),
  // enviamos un texto aclaratorio a la plantilla de EmailJS para que no quede raro en el correo.
  const templateParams = {
    to_name: 'Tienda Xamaran',
    from_name: clienteNombre,
    from_email: esEmailValido ? clienteEmail : 'No proporcionado',
    client_name: clienteNombre,
    client_email: esEmailValido ? clienteEmail : 'No proporcionado',
    client_phone: esTelefonoValido ? clienteTelefono : 'No proporcionado',
    observations: clienteObservaciones,
    items: itemsPlain,
    total: `${precioTotal} €`,
    timestamp: new Date().toLocaleString()
  };

  if (typeof emailjs === 'undefined'){
    alert('EmailJS no está cargado. Añade el script de EmailJS y tu user ID en el HTML.');
    return;
  }

  emailjs.send('service_ppc0l1c','template_a25b6vo', templateParams)
    .then(function(response){
      alert('Pedido solicitado a la tienda. Gracias.');
      
      // Limpiar el carrito e inputs tras enviar con éxito
      carrito = [];
      if (nameEl) nameEl.value = '';
      if (emailEl) emailEl.value = '';
      if (tlfEl) tlfEl.value = '';
      if (obsEl) obsEl.value = '';
      
      actualizarInterfazCarrito();
      
      // Cerrar modal
      const modal = document.getElementById('carrito-modal'); 
      if (modal) modal.style.display = 'none';
    }, function(error){
      console.error('EmailJS error:', error);
      alert('Error al enviar el pedido. Intenta de nuevo más tarde.');
    });
}