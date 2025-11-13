
let total = document.querySelector(".total-text span");
const darkBtn = document.querySelectorAll('ul li')[0];

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
}

darkBtn.addEventListener('click', function() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

export function initializeApp() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') enableDarkMode();
    else disableDarkMode();

    const savedTotal = localStorage.getItem("totalSpend");
    if (total && savedTotal) total.textContent = `$${savedTotal}`;

}


window.addEventListener('DOMContentLoaded', initializeApp);


