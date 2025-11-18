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


// ------------------ Get current user ------------------

let userEmail = localStorage.getItem("userEmail");



// ------------------ User-specific storage helpers ------------------
function getUserData() {
    const email = localStorage.getItem("userEmail");
    if (!email) return null; // no user logged in

    const data = localStorage.getItem("userBudgets");
    const budgets = data ? JSON.parse(data) : {};
    return budgets[email] || { totalBudget: null, remainingBudget: null, totalSpent: 0, isOverBudget: false };
}


function setUserData(data) {
    if (!userEmail) return;
    const budgets = localStorage.getItem("userBudgets") ? JSON.parse(localStorage.getItem("userBudgets")) : {};
    budgets[userEmail] = data;
    localStorage.setItem("userBudgets", JSON.stringify(budgets));
}

// ------------------ Load saved data ------------------



// Load saved data for current user
let userData = getUserData() || { totalBudget: null, remainingBudget: null, totalSpent: 0, isOverBudget: false };

export let totalBudget = userData.totalBudget;
export let remainingBudget = userData.remainingBudget;
export let totalSpent = userData.totalSpent;
export let isOverBudget = userData.isOverBudget;


// Initialize total display
if (totalTextSpan) totalTextSpan.textContent = `$${(totalSpent ?? 0).toFixed(2)}`;

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
        
        // Keep totalSpent intact
        isOverBudget = false;

        // Update user object in localStorage
        setUserData({ totalBudget, remainingBudget, totalSpent, isOverBudget });

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
        <h5>My Budget</h5>
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
    const remainingSpan = budgetCardDiv.querySelector("#remaining-budget");
    const progressFill = budgetCardDiv.querySelector("#progress-fill");
    const budgetUsedSpan = budgetCardDiv.querySelector("#budget-used");

    const numericPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;


    const barPercent = Math.min(numericPercent, 100);


    if (remainingSpan) {
        if (remainingBudget < 0) {
            remainingSpan.textContent = `-$${Math.abs(remainingBudget).toFixed(2)}`;
        } else {
            remainingSpan.textContent = `$${remainingBudget.toFixed(2)}`;
        }
    }

    
    if (progressFill) progressFill.style.width = `${barPercent}%`;

    if (budgetUsedSpan) budgetUsedSpan.textContent = `${numericPercent.toFixed(1)}% used`;

    if (totalSpent > totalBudget) {
        isOverBudget = true;
        if (overBudgetText) overBudgetText.style.display = "block";
        if (budgetCardDiv) budgetCardDiv.style.background = "#ec1414ff";
    } else {
        isOverBudget = false;
        if (overBudgetText) overBudgetText.style.display = "none";
        if (budgetCardDiv) budgetCardDiv.style.background = "";
    }

    setUserData({ totalBudget, remainingBudget, totalSpent, isOverBudget });
}


// ------------------ Save Budget ------------------
if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        
        if (!userEmail) {
            Swal.fire({
                icon: "warning",
                title: "Pease login first",
                confirmButtonColor: "#4f46e5"
            });
            return;
        }
        
        if (!budgetInput) return;
        
        const value = parseFloat(budgetInput.value);
        
        
        if (value <= 0) {
            Swal.fire({
                icon: "error",
                title: "Invalid Amount",
                text: "Budget amount must be greater than zero",
                confirmButtonColor: "#4f46e5"
            });
            return;
        }
        
        
        totalBudget = value;
        remainingBudget = value - totalSpent;
        if (remainingBudget < 0) remainingBudget = 0;
        isOverBudget = totalSpent > totalBudget;
        setUserData({ totalBudget, remainingBudget, totalSpent, isOverBudget });
        createBudgetCard();
        closeBudgetForm();
        
        
        location.reload();
    });
}


// ------------------ Add Purchase ------------------
export function addPurchase(amountValue) {
    const amount = parseFloat(amountValue);
    if (isNaN(amount) || amount <= 0) return false;

    totalSpent += amount;
    remainingBudget = totalBudget - totalSpent;
    if (remainingBudget < 0) remainingBudget = 0;

    setUserData({ totalBudget, remainingBudget, totalSpent, isOverBudget });

    if (totalTextSpan) totalTextSpan.textContent = `$${totalSpent.toFixed(2)}`;
    if (budgetCardDiv) checkOverBudget();

    return true;
}

// ------------------ Update Budget from Purchases ------------------
export function updateBudget(purchases) {
    let newTotal = 0;

    for (let i = 0; i < purchases.length; i++) {
        newTotal += parseFloat(purchases[i].amount);
    }

    totalSpent = newTotal;
    remainingBudget = totalBudget - totalSpent;
    if (remainingBudget < 0) remainingBudget = 0;

    if (totalTextSpan) totalTextSpan.textContent = `$${totalSpent.toFixed(2)}`;

    setUserData({ totalBudget, remainingBudget, totalSpent, isOverBudget });

    checkOverBudget();
}

export function clearCurrentUser() {

    localStorage.removeItem("userEmail");
}



// ------------------ Load ------------------
if (totalBudget !== null && remainingBudget !== null) createBudgetCard();
