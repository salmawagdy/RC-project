


let container = document.querySelector(".purchases-container");
let purchaseCounter = document.querySelector(".menu-text p span");
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
    if (document.body.classList.contains('dark-mode')) disableDarkMode();
    else enableDarkMode();
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') enableDarkMode();
    else disableDarkMode();

    const savedTotal = localStorage.getItem("totalSpend");
    if (savedTotal) total.textContent = `$${savedTotal}`;

    fetchPurchases();
});

function validatePurchase(nameValue, amountValue, dateValue) {
    if (!nameValue || !amountValue || !dateValue) return false;
    if (/^\d+$/.test(nameValue)) return false;
    if (isNaN(parseFloat(amountValue)) || parseFloat(amountValue) <= 0) return false;
    let todayDate = new Date().toISOString().split('T')[0];
    if (dateValue > todayDate) return false;
    return true;
}

function updateLocalTotal() {
    fetch("http://127.0.0.1:5000/purchases")
        .then(res => res.json())
        .then(data => {
            let sum = data.purchases.reduce((acc, p) => acc + parseFloat(p.amount), 0);
            total.textContent = `$${sum.toFixed(2)}`;
            localStorage.setItem("totalSpend", sum.toFixed(2));
        });
}

function fetchPurchases() {
    fetch("http://127.0.0.1:5000/purchases")
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";
            purchaseCounter.textContent = data.purchases.length;

            data.purchases.forEach(p => {
                const hr = document.createElement('hr');
                container.appendChild(hr);

                const ul = document.createElement('ul');
                ul.classList.add('purchase-items');
                ul.innerHTML = `
                    <li class="date-text">${p.date}</li>
                    <li class="name-text">${p.name}</li>
                    <li class="amount-text">$${p.amount.toFixed(2)}</li>
                    <li>
                        <img src="imgs/file-edit.svg" class="update-icon" alt="update">
                        <img src="imgs/trash.png" class="delete-icon" alt="delete">
                    </li>
                `;
                container.appendChild(ul);

                const updateBtn = ul.querySelector(".update-icon");
                const deleteBtn = ul.querySelector(".delete-icon");

                updateBtn.addEventListener("click", (e) => {
                    e.preventDefault()
                    const dateLi = ul.querySelector(".date-text");
                    const nameLi = ul.querySelector(".name-text");
                    const amountLi = ul.querySelector(".amount-text");

                    dateLi.innerHTML = `<input type="date" value="${p.date}" class="edit-date">`;
                    nameLi.innerHTML = `<input type="text" value="${p.name}" class="edit-name">`;
                    amountLi.innerHTML = `<input type="number" value="${p.amount}" class="edit-amount">`;

                    updateBtn.style.display = "none";

                    const saveBtn = document.createElement("button");
                    saveBtn.type = "button";
                    saveBtn.textContent = "Save";
                    saveBtn.classList.add("save-btn");
                    ul.querySelector("li:last-child").prepend(saveBtn);

                    saveBtn.addEventListener("click", () => {
                        const newDate = dateLi.querySelector(".edit-date").value;
                        const newName = nameLi.querySelector(".edit-name").value.trim();
                        const newAmount = parseFloat(amountLi.querySelector(".edit-amount").value);

                        if (!validatePurchase(newName, newAmount, newDate)) return;

                        fetch("http://127.0.0.1:5000/update_purchase", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                oldName: p.name,
                                name: newName,
                                amount: newAmount,
                                date: newDate
                            })
                        })
                        .then(res => res.json())
                        .then(() => {
                            updateLocalTotal();
                            fetchPurchases();
                        });
                    });
                });

                deleteBtn.addEventListener("click", (e) => {
                    e.preventDefault()
                    fetch("http://127.0.0.1:5000/delete_purchase", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: p.name })
                    })
                    .then(res => res.json())
                    .then(() => {
                        updateLocalTotal();
                        fetchPurchases();
                    });
                });
            });
        })
        .catch(err => console.error("Error fetching purchases:", err));
}
