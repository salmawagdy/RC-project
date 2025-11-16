const budgetBox = document.getElementById("budget-box");
const budgetFormPopup = document.querySelector(".set-budget"); 
const budgetInput = document.getElementById("budget-input");
const saveBtn = document.getElementById("budget-btn");
const closeBtn = document.querySelector(".close-btn");
const budgetForm = document.querySelector(".budget-form");
const purchaseForm = document.getElementById("purchase-form");
const amountInput = document.getElementById("amount");
const totalTextSpan = document.querySelector(".total-text span");

let budgetCardDiv;

// Load saved data
export let totalBudget = localStorage.getItem("totalBudget") ? parseFloat(localStorage.getItem("totalBudget")) : null;
export let remainingBudget = localStorage.getItem("remainingBudget") ? parseFloat(localStorage.getItem("remainingBudget")) : null;
export let totalSpent = localStorage.getItem("totalSpend") ? parseFloat(localStorage.getItem("totalSpend")) : 0;
export let isOverBudget = localStorage.getItem("isOverBudget") === "true";


// Initialize total display
if (totalTextSpan) totalTextSpan.textContent = `$${totalSpent.toFixed(2)}`;

// ------------------ Remove Budget Button ------------------
let removeBudgetBtn = document.createElement("button");
removeBudgetBtn.textContent = "Remove Budget";
removeBudgetBtn.className = "budget-button";
removeBudgetBtn.style.marginTop = "10px";
removeBudgetBtn.style.opacity = "0";
removeBudgetBtn.style.pointerEvents = "none";

if (budgetForm) budgetForm.appendChild(removeBudgetBtn);

function showRemoveBudgetBtn() {
    removeBudgetBtn.style.opacity = "1";
    removeBudgetBtn.style.pointerEvents = "auto";
}

function hideRemoveBudgetBtn() {
    removeBudgetBtn.style.opacity = "0";
    removeBudgetBtn.style.pointerEvents = "none";
}

// ------------------ Popup Logic ------------------
export function openBudgetForm() {
    if (!budgetFormPopup) return;
    budgetFormPopup.style.opacity = "1";
    budgetFormPopup.style.pointerEvents = "auto";
    totalBudget ? showRemoveBudgetBtn() : hideRemoveBudgetBtn();
}

function closeBudgetForm() {
    if (!budgetFormPopup) return;
    budgetFormPopup.style.opacity = "0";
    budgetFormPopup.style.pointerEvents = "none";
}

if (budgetBox) 
    budgetBox.addEventListener("click", openBudgetForm);

if (closeBtn) 
    closeBtn.addEventListener("click", closeBudgetForm);

if (budgetFormPopup) {
    budgetFormPopup.addEventListener("click", e => {
        if (e.target === budgetFormPopup) 
            closeBudgetForm();
    });
}

// ------------------ Remove Budget Logic ------------------
if (removeBudgetBtn) {
    removeBudgetBtn.addEventListener("click", () => {
        totalBudget = null;
        remainingBudget = null;


        localStorage.removeItem("totalBudget");
        localStorage.removeItem("remainingBudget");
        localStorage.removeItem("isOverBudget");

        if (budgetCardDiv) {
            budgetCardDiv.remove();
            budgetCardDiv = null;
        }

        hideRemoveBudgetBtn();
        closeBudgetForm();
    });
}

// ------------------ Budget Card ------------------
export function createBudgetCard() {
    if (!budgetBox || totalBudget === null || remainingBudget === null) return;

    budgetCardDiv = document.createElement("div");
    budgetCardDiv.className = "budget-card";

    budgetCardDiv.innerHTML = `
        <h5>Monthly Budget</h5>
        <div class="budget-total">
            <span id="budget-value-card">$${totalBudget.toFixed(2)}</span>
            <button id="edit-budget">Edit</button>
        </div>
        <div class="budget-remaining">
            Remaining: <span id="remaining-budget">$${remainingBudget.toFixed(2)}</span>
        </div>
        <div class="budget-progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <span id="budget-used">0% used</span>
        </div>
        <p id="over-budget-text" style="
            margin-top: -12px;
            text-align:center;
            font-weight: bold;
            color: white;
            display: none;
        ">Over Budget!</p>
    `;

    budgetBox.replaceWith(budgetCardDiv);

    const editBtn = budgetCardDiv.querySelector("#edit-budget");
    if (editBtn && budgetInput) {
        editBtn.addEventListener("click", () => {
            openBudgetForm();
            budgetInput.value = totalBudget;
        });
    }

    checkOverBudget();
}




// ------------------ Check / Over-Budget ------------------
export function checkOverBudget() {
    if (!budgetCardDiv || totalBudget === null) return;

    const overBudgetText = budgetCardDiv.querySelector("#over-budget-text");
    const usedPercent = totalBudget > 0 ? ((totalBudget - remainingBudget) / totalBudget) * 100 : 0;

    const remainingSpan = budgetCardDiv.querySelector("#remaining-budget");
    const progressFill = budgetCardDiv.querySelector("#progress-fill");
    const budgetUsedSpan = budgetCardDiv.querySelector("#budget-used");

    if (remainingSpan) remainingSpan.textContent = `$${remainingBudget.toFixed(2)}`;
    if (progressFill) progressFill.style.width = `${usedPercent}%`;
    if (budgetUsedSpan) budgetUsedSpan.textContent = `${usedPercent.toFixed(1)}% used`;

    if (totalSpent > totalBudget) {
        isOverBudget = true;
        if (overBudgetText) overBudgetText.style.display = "block";
        if (budgetCardDiv) budgetCardDiv.style.background = "#ec1414ff";
    } else {
        isOverBudget = false;
        if (overBudgetText) overBudgetText.style.display = "none";
        if (budgetCardDiv) budgetCardDiv.style.background = "";
    }

    localStorage.setItem("isOverBudget", isOverBudget);
}



// ------------------ Save Budget ------------------
if (saveBtn) {
    saveBtn.addEventListener("click", () => {
        if (!budgetInput) return;
        const value = parseFloat(budgetInput.value);
        if (isNaN(value) || value <= 0) return;

        totalBudget = value;
        remainingBudget=value - totalSpent;

        localStorage.setItem("totalBudget", totalBudget);
        localStorage.setItem("remainingBudget", remainingBudget);
        localStorage.setItem("totalSpend", totalSpent);
        localStorage.setItem("isOverBudget", false);

        createBudgetCard();
        closeBudgetForm();
    });
}



// ------------------ Update Budget After a Purchase ------------------
export function addPurchase(amountValue) {
    const amount = parseFloat(amountValue); // ensure it's a number
    if (isNaN(amount) || amount <= 0) return false;

    totalSpent += amount;
    remainingBudget = totalBudget - totalSpent;
    if (remainingBudget < 0) remainingBudget = 0;

    // Save in localStorage
    localStorage.setItem("totalSpend", totalSpent);
    localStorage.setItem("remainingBudget", remainingBudget);

    // Update UI immediately
    if (totalTextSpan) totalTextSpan.textContent = `$${totalSpent.toFixed(2)}`;
    if (budgetCardDiv) checkOverBudget();

    return true;
}

// ------------------ Reusable Budget Update Function ------------------

export function updateBudget(purchases) {
    let newTotal = 0;

    for (let i = 0; i < purchases.length; i++) {
        newTotal += parseFloat(purchases[i].amount);
    }

    totalSpent = newTotal;
    remainingBudget = totalBudget - totalSpent;
    if (remainingBudget < 0) remainingBudget = 0;

    // Update UI
    if (totalTextSpan) totalTextSpan.textContent = `$${totalSpent.toFixed(2)}`;

    // Update localStorage
    localStorage.setItem("totalSpend", totalSpent);
    localStorage.setItem("remainingBudget", remainingBudget);

    // Update budget card / progress bar
    checkOverBudget();
}

// ------------------ Load ------------------
if (totalBudget !== null && remainingBudget !== null) createBudgetCard();
