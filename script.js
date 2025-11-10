let form = document.querySelector("#myform");
let purchaseName = document.querySelector("#purchase");
let amount = document.querySelector("#amount");
let date = document.querySelector("#date");
let total = document.querySelector(".total-text span");

const darkBtn = document.querySelectorAll('ul li')[0];

function validatePurchase(nameValue, amountValue, dateValue) {
    if (!nameValue || !amountValue || !dateValue) {
        Swal.fire({
            icon: "warning",
            title: "Missing information",
            text: "Please fill in all fields before saving!",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }
    if (/^\d+$/.test(nameValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid purchase name",
            text: "Purchase must be a string",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }
    if (isNaN(parseFloat(amountValue)) || parseFloat(amountValue) <= 0) {
        Swal.fire({
            icon: "error",
            title: "Invalid amount",
            text: "Amount must be a positive number!",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }
    let todayDate = new Date().toISOString().split('T')[0];
    if (dateValue > todayDate) {
        Swal.fire({
            icon: "error",
            title: "Invalid date",
            text: "Date cannot be in the future",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }
    return true;
}

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
    if (savedTheme === 'dark') enableDarkMode();
    else disableDarkMode();

    const savedTotal = localStorage.getItem("totalSpend");
    if (savedTotal) total.textContent = `$${savedTotal}`;
});

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let nameValue = purchaseName.value.trim();
    let amountValue = amount.value.trim();
    let dateValue = date.value.trim();

    if (!validatePurchase(nameValue, amountValue, dateValue)) return;

    const purchaseData = {
        name: nameValue,
        amount: parseFloat(amountValue),
        date: dateValue
    };

    fetch("http://127.0.0.1:5000/add_purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            Swal.fire({
                icon: "success",
                title: "Purchase added successfully!",
                showConfirmButton: false,
            });

            purchaseName.value = '';
            amount.value = '';
            date.value = '';

            let currentTotal = parseFloat(localStorage.getItem("totalSpend")) || 0;
            currentTotal += parseFloat(amountValue);
            total.textContent = `$${currentTotal.toFixed(2)}`;
            localStorage.setItem("totalSpend", currentTotal.toFixed(2));
        } else if (data.status === "warning") {
            Swal.fire({ icon: "warning", title: data.message, confirmButtonColor: "#4f46e5" });
        } else {
            Swal.fire({ icon: "error", title: data.message, confirmButtonColor: "#4f46e5" });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        Swal.fire({ icon: "error", title: "Something went wrong!", confirmButtonColor: "#4f46e5" });
    });
});