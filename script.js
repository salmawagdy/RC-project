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
    let amountValue = amount.value.trim();
    let dateValue = date.value.trim();

    if (nameValue === "" || amountValue === "" || dateValue === "") {
        Swal.fire({
            icon: "warning",
            title: "Missing information",
            text: "Please fill in all fields before saving!"
        });
        return;
    }

    if (/^\d+$/.test(nameValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid purchase name",
            text: "Purchase must be a string"
        });
        return;
    }

    if (isNaN(parseFloat(amountValue))|| parseFloat(amountValue) <= 0) {
        Swal.fire({
            icon: "error",
            title: "Invalid amount",
            text: "Amount must be a positive number!"
        });
        return;
    }

    let todayDate = new Date().toISOString().split('T')[0];
    if (dateValue > todayDate) {
        Swal.fire({
            icon: "error",
            title: "Invalid date",
            text: "Date cannot be in the future"
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Purchase added successfully!",
        showConfirmButton: false,
        timer: 1500
    });

    purchaseName.value = '';
    amount.value = '';
    date.value = '';
});
