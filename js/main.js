const hamburger = document.getElementById('hamburger'); /* Busca el elemento cuyo ID es "hamburguesa"*/
const menuMovil = document.getElementById('menu-movil');

hamburger.addEventListener('click', function() {
    const menuAbierto = menuMovil.classList.toggle('abierto');

    hamburger.setAttribute('aria-expanded', menuAbierto);
    hamburger.setAttribute(
        'aria-label',
        menuAbierto ? 'Cerrar menú' : 'Abrir menú'
    );
});

menuMovil.querySelectorAll('a').forEach(function(enlace) { /*a viene de los enlaces dentro del menú móvil, for each es un método que permite iterar sobre una lista de elementos, y function es la función que se ejecutará para cada enlace*/
    enlace.addEventListener('click', function() {
        menuMovil.classList.remove('abierto'); /* Cuando se hace clic en un enlace, se cierra el menú móvil eliminando la clase "abierto" del elemento del menú móvil. Esto asegura que el menú se cierre después de seleccionar una opción. */
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
    });
});
