import { validatePurchase } from "./add.js";
import { initializeApp } from "./script.js";
import { updateBudget} from "./budget.js"; 
window.addEventListener('DOMContentLoaded', initializeApp);


const updateBtn = document.querySelectorAll("#update-icon");
const deleteBtn = document.querySelectorAll(".delete-icon");

let countText = document.querySelector(".menu-text p span");





fetch("http://127.0.0.1:5000/purchase_count", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
})
.then(response => response.json())
.then(data => {
    if (data.status === "success" && countText) {
        countText.textContent = data.count;
    } else {
        console.error("Error:", data.message);
    }
})
.catch(error => console.error("Error fetching purchase count:", error));




updateBtn.forEach((updateBtn) => {
    updateBtn.addEventListener("click", async(e) => {
        e.preventDefault();

        const ul = updateBtn.closest("ul");
        const dateLi = ul.querySelector(".date-text");
        const nameLi = ul.querySelector(".name-text");
        const amountLi = ul.querySelector(".amount-text");

        const oldDate = dateLi.textContent;
        const oldName = nameLi.textContent;
        const oldAmount = parseFloat(amountLi.textContent.replace("$", ""));

    
        dateLi.innerHTML = `<input type="date" value="${oldDate}" class="edit-date">`;
        nameLi.innerHTML = `<input type="text" value="${oldName}" class="edit-name">`;
        amountLi.innerHTML = `<input type="text" value="${oldAmount}" class="edit-amount">`;

        updateBtn.style.display = "none";

        
        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.textContent = "Save";
        saveBtn.classList.add("save-btn");


        const actionLi = ul.querySelector("li:last-child");
        actionLi.prepend(saveBtn);

        function restoreOriginal() {
            dateLi.textContent = oldDate;
            nameLi.textContent = oldName;
            amountLi.textContent = `$${oldAmount.toFixed(2)}`;
            saveBtn.remove();
            updateBtn.style.display = "inline";
        }


        const outsideHandler = (e) => {
            if (!ul.contains(e.target)) {
                restoreOriginal();
                document.removeEventListener("click", outsideHandler);
            }
        };
        document.addEventListener("click", outsideHandler);

        saveBtn.addEventListener("click", () => {
            const newDate = dateLi.querySelector(".edit-date").value;
            const newName = nameLi.querySelector(".edit-name").value.trim();
            const newAmount = parseFloat(amountLi.querySelector(".edit-amount").value);

            if (!validatePurchase(newName, newAmount, newDate)) return;

            fetch("/update_purchase", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    oldName,
                    oldAmount,
                    oldDate,
                    name: newName,
                    amount: newAmount,
                    date: newDate
                })
            })
            .then(res => res.json())
            .then(data => {  
                if (data.status === "success") {
                    dateLi.textContent = newDate;
                    nameLi.textContent = newName;
                    amountLi.textContent = `$${newAmount.toFixed(2)}`;
                    saveBtn.remove();
                    updateBtn.style.display = "inline";
                    updateBudget(data.purchases);

                    Swal.fire({
                        icon: "success",
                        title: "Purchase updated successfully!",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    Swal.fire({
                        icon: data.status === "warning" ? "warning" : "error",
                        title: data.message || "failed to update purchase",
                        confirmButtonColor: "#4f46e5"
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to update purchase"
                });
            });
        });
    });
});

// ---------------- Delete Purchase ----------------
deleteBtn.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", async(e) => {
        e.preventDefault();

        const ul = deleteBtn.closest("ul");
        const dateLi = ul.querySelector(".date-text");
        const nameLi = ul.querySelector(".name-text");
        const amountLi = ul.querySelector(".amount-text");
        const purchaseName = nameLi.textContent;
        const purchaseAmount = amountLi ? amountLi.textContent.replace('$', '').trim() : null;
        const purchaseDate = dateLi ? dateLi.textContent.trim() : null;

        Swal.fire({
            title: `Delete purchase "${purchaseName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/delete_purchase", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ 
                        name: purchaseName,
                        amount: purchaseAmount,
                        date: purchaseDate
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        const prevHr = ul.previousElementSibling;
                        ul.remove();
                        if (prevHr && prevHr.tagName === "HR") prevHr.remove();

                        updateBudget(data.purchases)

                        if (countText) countText.textContent = data.purchases.length;

                        Swal.fire({
                            icon: "success",
                            title: "Purchase deleted!",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: data.message || "Failed to delete purchase"

                        });
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to delete purchase"
                    });
                });
            }
        });
    });
});