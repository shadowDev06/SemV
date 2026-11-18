// ExpenseTracker - vanilla JavaScript with Fetch API and async/await
const API_URL = "http://localhost:3000/expenses";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const byId = (id) => document.getElementById(id);

const expenseForm = byId("expenseForm");
const expenseDialog = byId("expenseDialog");
const deleteDialog = byId("deleteDialog");
const expenseTable = document.querySelector("table");
const expenseTableBody = byId("expenseTableBody");
const loadingState = byId("loadingState");
const emptyState = byId("emptyState");
const errorState = byId("errorState");
const searchInput = byId("searchInput");
const statusFilter = byId("statusFilter");
const sortBy = byId("sortBy");
const saveExpenseBtn = byId("saveExpenseBtn");
const confirmDeleteBtn = byId("confirmDeleteBtn");

let expenses = [];
let editingId = null;
let deletingId = null;
let isLoading = false;
let hasLoadError = false;

// Escape user content before placing it in an HTML template.
function escapeHTML(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return String(value ?? "").replace(/[&<>"']/g, (character) => characters[character]);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getToday() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().split("T")[0];
}

function getCategoryClass(category) {
  const classNames = {
    "Food & Dining": "food",
    "Transport": "transport",
    "Housing": "housing",
    "Utilities": "utilities",
    "Entertainment": "entertainment",
    "Shopping": "shopping",
    "Health": "health",
    "Education": "education",
    "Travel": "travel",
    "Other": "other"
  };
  return `category-${classNames[category] || "other"}`;
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${type === "success" ? "✓" : "!"}</span>`;

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);
  byId("toastContainer").appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
    window.setTimeout(() => toast.remove(), 180);
  }, 3500);
}

function setApiStatus(state) {
  const apiPill = byId("apiPill");
  const apiStatusText = byId("apiStatusText");
  apiPill.dataset.state = state;

  const labels = {
    loading: "Connecting...",
    online: "API online",
    offline: "API offline"
  };
  apiStatusText.textContent = labels[state];
}

// Show a small, readable history of JSON requests and responses.
function recordActivity(method, endpoint, status, statusText, data) {
  const activityList = byId("activityList");
  byId("activityEmpty")?.remove();

  const item = document.createElement("li");
  item.className = "activity-item";
  const successful = status >= 200 && status < 300;
  const responseLabel = status === 0 ? "Network error" : `${status} ${statusText}`;
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());

  item.innerHTML = `
    <span class="method method-${method.toLowerCase()}">${method}</span>
    <div class="activity-info">
      <strong>/expenses${escapeHTML(endpoint)}</strong>
      <small><i class="response-dot ${successful ? "" : "failed"}"></i>${escapeHTML(responseLabel)} · ${time}</small>
    </div>`;

  activityList.prepend(item);
  while (activityList.children.length > 5) {
    activityList.lastElementChild.remove();
  }

  let preview = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  if (!preview) preview = "No response body";
  if (preview.length > 3000) preview = `${preview.slice(0, 3000)}\n... preview truncated`;
  byId("responsePreview").textContent = preview;
}

// One reusable request function keeps all four CRUD operations consistent.
async function apiRequest(method, endpoint = "", body) {
  const options = {
    method,
    headers: { "Accept": "application/json" }
  };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, options);
  } catch (error) {
    const errorData = { error: "Unable to reach json-server" };
    recordActivity(method, endpoint, 0, "", errorData);
    setApiStatus("offline");
    throw new Error("Cannot connect to json-server. Run ‘npm run server’ in another terminal, then try again.");
  }

  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      data = responseText;
    }
  }

  recordActivity(method, endpoint, response.status, response.statusText, data);
  setApiStatus("online");

  if (!response.ok) {
    throw new Error(`json-server returned ${response.status} ${response.statusText}. Please try again.`);
  }

  return data;
}

function renderSummary() {
  const paidExpenses = expenses.filter((expense) => expense.status === "Paid");
  const pendingExpenses = expenses.filter((expense) => expense.status === "Pending");
  const sumAmounts = (records) => records.reduce((total, expense) => total + Number(expense.amount), 0);
  const categories = new Set(expenses.map((expense) => expense.category));

  byId("totalAmount").textContent = currency.format(sumAmounts(expenses));
  byId("paidAmount").textContent = currency.format(sumAmounts(paidExpenses));
  byId("pendingAmount").textContent = currency.format(sumAmounts(pendingExpenses));
  byId("expenseCount").textContent = expenses.length.toLocaleString("en-US");

  byId("totalCaption").textContent = expenses.length === 0
    ? "No expenses recorded"
    : `${expenses.length} recorded ${pluralize(expenses.length, "expense")}`;
  byId("paidCaption").textContent = `${paidExpenses.length} ${pluralize(paidExpenses.length, "payment")} completed`;
  byId("pendingCaption").textContent = `${pendingExpenses.length} ${pluralize(pendingExpenses.length, "payment")} awaiting`;
  byId("categoryCaption").textContent = `Across ${categories.size} ${pluralize(categories.size, "category", "categories")}`;
}

function getVisibleExpenses() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredExpenses = expenses.filter((expense) => {
    const searchableText = `${expense.title} ${expense.description || ""} ${expense.category}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);
    const matchesStatus = selectedStatus === "All" || expense.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return filteredExpenses.sort((first, second) => {
    switch (sortBy.value) {
      case "date-asc":
        return first.date.localeCompare(second.date);
      case "amount-desc":
        return Number(second.amount) - Number(first.amount);
      case "amount-asc":
        return Number(first.amount) - Number(second.amount);
      case "title-asc":
        return first.title.localeCompare(second.title);
      case "date-desc":
      default:
        return second.date.localeCompare(first.date);
    }
  });
}

function createExpenseRow(expense) {
  const id = String(expense.id);
  const safeTitle = escapeHTML(expense.title);
  const safeDescription = escapeHTML(expense.description || "No description added");
  const safeCategory = escapeHTML(expense.category);
  const safeStatus = escapeHTML(expense.status);
  const statusClass = expense.status === "Paid" ? "status-paid" : "status-pending";

  return `
    <tr>
      <td class="expense-main">
        <div class="expense-cell">
          <span class="expense-icon ${getCategoryClass(expense.category)}" aria-hidden="true">${escapeHTML(String(expense.category).charAt(0))}</span>
          <div class="expense-copy">
            <strong class="expense-title" title="${safeTitle}">${safeTitle}</strong>
            <span class="expense-description" title="${safeDescription}">${safeDescription}</span>
          </div>
        </div>
      </td>
      <td class="category-cell"><span class="category-label">${safeCategory}</span></td>
      <td class="date-cell"><span class="date-label">${formatDate(expense.date)}</span></td>
      <td class="status-cell"><span class="status-badge ${statusClass}">${safeStatus}</span></td>
      <td class="amount-cell">${currency.format(Number(expense.amount))}</td>
      <td class="action-cell">
        <div class="row-actions">
          <button class="icon-button" type="button" data-action="edit" data-id="${escapeHTML(id)}" aria-label="Edit ${safeTitle}" title="Edit expense">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14.5 5.5 4 4M4 20l4.5-1 10-10a2.8 2.8 0 0 0-4-4l-10 10L4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="icon-button delete-button" type="button" data-action="delete" data-id="${escapeHTML(id)}" aria-label="Delete ${safeTitle}" title="Delete expense">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m2 0-.8 13H7.8L7 7m4 4v5m3-5v5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
}

function renderExpenses() {
  const visibleExpenses = getVisibleExpenses();

  loadingState.hidden = !isLoading;
  errorState.hidden = isLoading || !hasLoadError;
  expenseTable.hidden = isLoading || hasLoadError || visibleExpenses.length === 0;
  emptyState.hidden = isLoading || hasLoadError || visibleExpenses.length > 0;

  if (isLoading) {
    byId("resultCount").textContent = "Loading your transactions...";
    byId("tableSummary").textContent = "Please wait";
    expenseTableBody.innerHTML = "";
    return;
  }

  if (hasLoadError) {
    byId("resultCount").textContent = "Unable to load transactions";
    byId("tableSummary").textContent = "No data available";
    expenseTableBody.innerHTML = "";
    return;
  }

  expenseTableBody.innerHTML = visibleExpenses.map(createExpenseRow).join("");
  byId("resultCount").textContent = `${visibleExpenses.length} of ${expenses.length} ${pluralize(expenses.length, "transaction")}`;
  byId("tableSummary").textContent = `Showing ${visibleExpenses.length} ${pluralize(visibleExpenses.length, "expense")}`;

  if (visibleExpenses.length === 0) {
    const noRecordsAtAll = expenses.length === 0;
    byId("emptyTitle").textContent = noRecordsAtAll ? "No expenses yet" : "No matching expenses";
    byId("emptyMessage").textContent = noRecordsAtAll
      ? "Add your first expense to start understanding your spending."
      : "Try a different search term or clear the current filters.";
    byId("emptyAction").textContent = noRecordsAtAll ? "Add your first expense" : "Clear filters";
  }
}

function renderDashboard() {
  renderSummary();
  renderExpenses();
}

async function loadExpenses() {
  isLoading = true;
  hasLoadError = false;
  setApiStatus("loading");
  renderExpenses();

  try {
    const data = await apiRequest("GET");
    expenses = Array.isArray(data) ? data : [];
  } catch (error) {
    hasLoadError = true;
    byId("loadErrorMessage").textContent = error.message;
  } finally {
    isLoading = false;
    renderDashboard();
  }
}

function clearValidation() {
  byId("formError").hidden = true;
  expenseForm.querySelectorAll(".invalid").forEach((field) => {
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
  });
  expenseForm.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function setFieldError(fieldName, message) {
  const field = byId(fieldName);
  field.classList.add("invalid");
  field.setAttribute("aria-invalid", "true");
  expenseForm.querySelector(`[data-error-for="${fieldName}"]`).textContent = message;
}

function validateForm() {
  clearValidation();
  let firstInvalidField = null;
  const showError = (fieldName, message) => {
    setFieldError(fieldName, message);
    if (!firstInvalidField) firstInvalidField = byId(fieldName);
  };

  const title = byId("title").value.trim();
  const description = byId("description").value.trim();
  const amountText = byId("amount").value.trim();
  const amount = Number(amountText);
  const date = byId("date").value;
  const category = byId("category").value;
  const status = byId("status").value;

  if (!title) {
    showError("title", "Please enter an expense title.");
  } else if (title.length < 2) {
    showError("title", "The title must be at least 2 characters long.");
  }

  if (description.length > 160) {
    showError("description", "Keep the description under 160 characters.");
  }

  if (!amountText) {
    showError("amount", "Please enter an amount.");
  } else if (!Number.isFinite(amount) || !/^\d+(\.\d{1,2})?$/.test(amountText)) {
    showError("amount", "Enter a valid amount with up to 2 decimal places.");
  } else if (amount <= 0) {
    showError("amount", "The amount must be greater than zero.");
  } else if (amount > 1000000) {
    showError("amount", "The amount cannot exceed $1,000,000.");
  }

  if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
    showError("date", "Please choose a valid expense date.");
  }
  if (!category) showError("category", "Please choose a category.");
  if (!["Paid", "Pending"].includes(status)) showError("status", "Choose Paid or Pending.");

  if (firstInvalidField) {
    firstInvalidField.focus();
    return false;
  }
  return true;
}

function openAddExpense() {
  editingId = null;
  expenseForm.reset();
  clearValidation();
  byId("date").value = getToday();
  byId("status").value = "Paid";
  byId("formEyebrow").textContent = "NEW EXPENSE";
  byId("formTitle").textContent = "Add an expense";
  byId("formSubtitle").textContent = "Record a new transaction in a few seconds.";
  byId("saveButtonText").textContent = "Save expense";
  expenseDialog.showModal();
  byId("title").focus();
}

function openEditExpense(id) {
  const expense = expenses.find((item) => String(item.id) === String(id));
  if (!expense) {
    showToast("That expense could not be found. Try reloading the list.", "error");
    return;
  }

  editingId = String(id);
  expenseForm.reset();
  clearValidation();
  byId("title").value = expense.title;
  byId("description").value = expense.description || "";
  byId("amount").value = expense.amount;
  byId("category").value = expense.category;
  byId("date").value = expense.date;
  byId("status").value = expense.status;
  byId("formEyebrow").textContent = "EDIT EXPENSE";
  byId("formTitle").textContent = "Update expense";
  byId("formSubtitle").textContent = "Make your changes and save the updated record.";
  byId("saveButtonText").textContent = "Update expense";
  expenseDialog.showModal();
  byId("title").focus();
}

async function saveExpense(event) {
  event.preventDefault();
  if (saveExpenseBtn.disabled || !validateForm()) return;

  const expenseData = {
    title: byId("title").value.trim(),
    description: byId("description").value.trim(),
    amount: Number(Number(byId("amount").value).toFixed(2)),
    category: byId("category").value,
    date: byId("date").value,
    status: byId("status").value
  };

  const isEditing = editingId !== null;
  const requestId = editingId;
  saveExpenseBtn.disabled = true;
  byId("saveButtonText").textContent = isEditing ? "Updating..." : "Saving...";

  try {
    const savedExpense = await apiRequest(
      isEditing ? "PATCH" : "POST",
      isEditing ? `/${encodeURIComponent(requestId)}` : "",
      expenseData
    );

    if (isEditing) {
      const index = expenses.findIndex((expense) => String(expense.id) === String(requestId));
      if (index !== -1) expenses[index] = savedExpense;
    } else {
      expenses.push(savedExpense);
    }

    renderDashboard();
    expenseDialog.close();
    showToast(isEditing ? "Expense updated successfully." : "Expense added successfully.");
  } catch (error) {
    byId("formError").textContent = error.message;
    byId("formError").hidden = false;
  } finally {
    saveExpenseBtn.disabled = false;
    byId("saveButtonText").textContent = isEditing ? "Update expense" : "Save expense";
  }
}

function openDeleteConfirmation(id) {
  const expense = expenses.find((item) => String(item.id) === String(id));
  if (!expense) {
    showToast("That expense could not be found.", "error");
    return;
  }
  deletingId = String(id);
  byId("deleteExpenseName").textContent = expense.title;
  deleteDialog.showModal();
}

async function deleteExpense() {
  if (deletingId === null || confirmDeleteBtn.disabled) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting...";

  try {
    await apiRequest("DELETE", `/${encodeURIComponent(deletingId)}`);
    expenses = expenses.filter((expense) => String(expense.id) !== String(deletingId));
    deletingId = null;
    renderDashboard();
    deleteDialog.close();
    showToast("Expense deleted successfully.");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Delete expense";
  }
}

function clearFilters() {
  searchInput.value = "";
  statusFilter.value = "All";
  sortBy.value = "date-desc";
  renderExpenses();
  searchInput.focus();
}

function setDashboardText() {
  byId("currentDate").textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  byId("greeting").textContent = `${greeting}, Jamie`;
}

// Event listeners: filters, table actions, forms, and dialog controls.
byId("openAddBtn").addEventListener("click", openAddExpense);
byId("retryBtn").addEventListener("click", loadExpenses);
byId("emptyAction").addEventListener("click", () => {
  if (expenses.length === 0) openAddExpense();
  else clearFilters();
});

searchInput.addEventListener("input", renderExpenses);
statusFilter.addEventListener("change", renderExpenses);
sortBy.addEventListener("change", renderExpenses);
expenseForm.addEventListener("submit", saveExpense);
confirmDeleteBtn.addEventListener("click", deleteExpense);

expenseTableBody.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) return;

  if (actionButton.dataset.action === "edit") openEditExpense(actionButton.dataset.id);
  if (actionButton.dataset.action === "delete") openDeleteConfirmation(actionButton.dataset.id);
});

expenseForm.addEventListener("input", (event) => {
  const field = event.target;
  if (!field.name) return;
  field.classList.remove("invalid");
  field.removeAttribute("aria-invalid");
  const error = expenseForm.querySelector(`[data-error-for="${field.name}"]`);
  if (error) error.textContent = "";
  byId("formError").hidden = true;
});

expenseForm.addEventListener("change", (event) => {
  event.target.dispatchEvent(new Event("input", { bubbles: true }));
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => byId(button.dataset.close).close());
});

[expenseDialog, deleteDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

expenseDialog.addEventListener("close", () => {
  editingId = null;
  clearValidation();
});

deleteDialog.addEventListener("close", () => {
  if (!confirmDeleteBtn.disabled) deletingId = null;
});

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement.tagName;
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
  const dialogIsOpen = expenseDialog.open || deleteDialog.open;
  if (event.key === "/" && !isTyping && !dialogIsOpen) {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

setDashboardText();
renderDashboard();
loadExpenses();
