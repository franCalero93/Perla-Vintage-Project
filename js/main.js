const hamburger = document.getElementById('hamburger'); /* Busca el elemento cuyo ID es "hamburguesa"*/
const menuMovil = document.getElementById('menu-movil');

hamburger.addEventListener('click', function() {
    menuMovil.classList.toggle('abierto');
});


