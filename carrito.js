let carrito = [];

// 1. Función para añadir al carrito
function añadirAlCarrito(nombre, precio) {
  carrito.push({ nombre, precio: parseFloat(precio) });
  actualizarInterfazCarrito();
}

// 2. Función para actualizar los números de la cabecera
function actualizarInterfazCarrito() {
  const cantidadTotal = carrito.length;
  const precioTotal = carrito.reduce((sum, item) => sum + item.precio, 0);

  document.getElementById('carrito-cantidad').innerText = `${cantidadTotal} productos`;
  document.getElementById('carrito-total').innerText = `${precioTotal.toFixed(2)} €`;
  
  // Actualizar la lista visual dentro del modal
  const lista = document.getElementById('lista-carrito');
  lista.innerHTML = '';
  carrito.forEach(item => {
    const li = document.createElement('li');
    li.innerText = `${item.nombre} - ${item.precio.toFixed(2)} €`;
    lista.appendChild(li);
  });
  document.getElementById('modal-total').innerText = `${precioTotal.toFixed(2)} €`;
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

// 4. Lógica para abrir/cerrar el listado (Modal)
const modal = document.getElementById('carrito-modal');
document.getElementById('abrir-carrito').onclick = () => modal.style.display = "block";
document.querySelector('.cerrar-modal').onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }