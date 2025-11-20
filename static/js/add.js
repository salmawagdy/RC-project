
import { addPurchase } from "./budget.js";




let form = document.querySelector("#purchase-form");
let purchaseName = document.querySelector("#purchase");
let amount = document.querySelector("#amount");
let date = document.querySelector("#date");
let countText = document.querySelector(".menu-text p span");




export function validatePurchase(nameValue, amountValue, dateValue) {
    if (nameValue === "" || amountValue === "" || dateValue === "") {
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
    const todayDate = new Date().toISOString().split('T')[0];
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


if (form) {
    form.addEventListener("submit", async function(e) {
        e.preventDefault();


        const nameValue = purchaseName.value.trim();
        const amountValue = amount.value.trim();
        const dateValue = date.value.trim();

        if (!validatePurchase(nameValue, amountValue, dateValue)) return;

        const purchaseData = {
            name: nameValue,
            amount: parseFloat(amountValue),
            date: dateValue
        };

        fetch("http://127.0.0.1:5000/add_purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(purchaseData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                if (countText) 
                    {countText.textContent = data.purchases.length
                }
                Swal.fire({
                    icon: "success",
                    title: "Purchase added successfully!",
                    showConfirmButton: false,
                    timer: 1500
                });
                
                addPurchase(amountValue);
                purchaseName.value = '';
                amount.value = '';
                date.value = '';
            } else {
                Swal.fire({
                    icon: data.status === "warning" ? "warning" : "error",
                    title: data.message,
                    confirmButtonColor: "#4f46e5"   
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Something went wrong!",
                confirmButtonColor: "#4f46e5"
            });
        });
    });
}
