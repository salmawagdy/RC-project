let darkBtn = document.querySelectorAll('ul li')[0];

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

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});


let purchaseName = document.querySelector("#purchase");
let amount = document.querySelector("#amount");
let date = document.querySelector("#date");
let submit = document.querySelector("button");

submit.addEventListener('click', function(e) {
    e.preventDefault();

    let nameValue = purchaseName.value.trim();
    let amountValue = parseFloat(amount.value.trim());
    let dateValue = date.value;

    if (nameValue === "") {
        alert("Please enter a purchase name.");
        return;
    }

    if (isNaN(amountValue) || amountValue <= 0) {
        alert("Please enter a vaild amout.");
        return;
    }

    if (dateValue === "") {
        alert("Please select a date.");
        return;
    }

    let today = new Date().toISOString().split("T")[0];
    if (dateValue > today) {
        alert("Date cannot be in the future.");
        return;
    }

    console.log("Saved successfully!");
});
