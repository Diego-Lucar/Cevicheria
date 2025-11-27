
function showSidebar(event) {
    if(event) event.preventDefault();
    document.querySelector('.sidebar').style.display="flex";
}
function hideSidebar(event) {
    if(event) event.preventDefault();
    document.querySelector('.sidebar').style.display="none";
}

window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(19, 44, 82, 0.95)';
        nav.style.backdropFilter = 'blur(7px)';
    } else {
        nav.style.background = 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #2d6a8f 100%)';
        nav.style.backdropFilter = 'none';
    }
});