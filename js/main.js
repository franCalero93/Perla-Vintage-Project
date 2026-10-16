const hamburger = document.getElementById('hamburger');
const menuMovil = document.getElementById('menu-movil');

hamburger.addEventListener('click', function() {
    menuMovil.classList.toggle('abierto');
});