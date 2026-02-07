//  = function () {

// }


document.addEventListener('DOMContentLoaded', function () {
    if(!sessionStorage.getItem('username')){
        window.location.reload();
        window.location.href = 'index.html';
    }
});
document.getElementById('logout-form').addEventListener('submit', function (e) {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = 'index.html';
});

// Block the user from navigating back
window.history.pushState(null, "", window.location.href);

// Listen for popstate efent (back button)
window.onpopstate = function() {
    window.history.pushState(null, "", window.location.href);
};