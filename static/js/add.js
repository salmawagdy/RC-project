import { initializeApp} from "./script.js";
window.addEventListener('DOMContentLoaded', initializeApp);



let form = document.querySelector("#purchase-form");
let purchaseName = document.querySelector("#purchase");
let amount = document.querySelector("#amount");
let date = document.querySelector("#date");
let total = document.querySelector(".total-text span");


export function validatePurchase(nameValue, amountValue, dateValue) {
    if (nameValue==="" || amountValue==="" || dateValue==="") {
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

export function setTotal(amountValue) {
    let currentTotal = parseFloat(localStorage.getItem("totalSpend")) || 0;
    currentTotal += parseFloat(amountValue);
    total.textContent = `$${currentTotal.toFixed(2)}`;
    localStorage.setItem("totalSpend", currentTotal.toFixed(2));
}


if(form){
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
                timer: 1500
            });
            purchaseName.value = '';
            amount.value = '';
            date.value = '';

        setTotal(amountValue);

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

}

