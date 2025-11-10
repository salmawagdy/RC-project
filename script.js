// let darkBtn = document.querySelectorAll('ul li')[0];

// function enableDarkMode() {
//     document.body.classList.add('dark-mode');
//     localStorage.setItem('theme', 'dark');
// }

// function disableDarkMode() {
//     document.body.classList.remove('dark-mode');
//     localStorage.setItem('theme', 'light');
// }

// darkBtn.addEventListener('click', function() {
//     if (document.body.classList.contains('dark-mode')) {
//         disableDarkMode();
//     } else {
//         enableDarkMode();
//     }
// });

// window.addEventListener('DOMContentLoaded', () => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark') {
//         enableDarkMode();
//     } else {
//         disableDarkMode();
//     }
// });

let form = document.querySelector("form");
let purchaseName = document.querySelector("#purchase");
let amount = document.querySelector("#amount");
let date = document.querySelector("#date");

form.addEventListener("submit", function(e) {
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
        return false;
    }

    if (/^\d+$/.test(nameValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid purchase name",
            text: "Purchase must be a string"
        });
        return false;
    }

    if (isNaN(parseFloat(amountValue)) || parseFloat(amountValue) <= 0) {
        Swal.fire({
            icon: "error",
            title: "Invalid amount",
            text: "Amount must be a positive number!"
        });
        return false;
    }

    let todayDate = new Date().toISOString().split('T')[0];
    if (dateValue > todayDate) {
        Swal.fire({
            icon: "error",
            title: "Invalid date",
            text: "Date cannot be in the future"
        });
        return false;
    }

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
                timer: 3000,
                timerProgressBar: true
            }).then(() => {
                purchaseName.value = '';
                amount.value = '';
                date.value = '';
            });
        } else if (data.status === "warning") {
            Swal.fire({
                icon: "warning",
                title: data.message
            });
        } else if (data.status === "error") {
            Swal.fire({
                icon: "error",
                title: data.message
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Something went wrong!"
        });
    });
    
    return false;
});