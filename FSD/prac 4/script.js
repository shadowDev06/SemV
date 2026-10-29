class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class FormValidator {
  constructor(form) {
    this.form = form;
    this.fields = {
      fullName: form.elements.fullName,
      email: form.elements.email,
      phone: form.elements.phone,
      course: form.elements.course,
      message: form.elements.message,
      terms: form.elements.terms
    };
  }

  validateField(fieldName) {
    const value = this.fields[fieldName].value.trim();

    switch (fieldName) {
      case "fullName":
        if (!/^[A-Za-z ]{2,50}$/.test(value)) {
          throw new ValidationError(fieldName, "Enter a name using 2-50 letters.");
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          throw new ValidationError(fieldName, "Enter a valid email address.");
        }
        break;
      case "phone":
        if (!/^\d{10}$/.test(value.replace(/\D/g, ""))) {
          throw new ValidationError(fieldName, "Enter exactly 10 digits.");
        }
        break;
      case "course":
        if (!value) {
          throw new ValidationError(fieldName, "Select a course.");
        }
        break;
      case "message":
        if (value.length < 20) {
          throw new ValidationError(fieldName, "Write at least 20 characters.");
        }
        break;
      case "terms":
        if (!this.fields.terms.checked) {
          throw new ValidationError(fieldName, "Accept the terms to continue.");
        }
        break;
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }

    return true;
  }

  validateAll() {
    Object.keys(this.fields).forEach(fieldName => this.validateField(fieldName));
    return true;
  }

  clearErrors() {
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      const error = document.querySelector(`#${field.id}-error`);
      field.classList.remove("invalid", "valid");
      field.removeAttribute("aria-invalid");
      if (error) {
        error.textContent = "";
      }
    });
  }

  showError(error) {
    const field = this.fields[error.field];
    const message = document.querySelector(`#${field.id}-error`);
    field.classList.add("invalid");
    field.classList.remove("valid");
    field.setAttribute("aria-invalid", "true");
    message.textContent = error.message;
  }

  showValid(fieldName) {
    const field = this.fields[fieldName];
    const message = document.querySelector(`#${field.id}-error`);
    field.classList.remove("invalid");
    field.classList.add("valid");
    field.setAttribute("aria-invalid", "false");
    message.textContent = "";
  }
}

const form = document.querySelector("#registration-form");
const validator = new FormValidator(form);
const formMessage = document.querySelector("#form-message");
const messageInput = validator.fields.message;
const characterCount = document.querySelector("#character-count");

function updateCharacterCount() {
  characterCount.textContent = `${messageInput.value.length}/250`;
}

function validateSingleField(fieldName) {
  try {
    validator.validateField(fieldName);
    validator.showValid(fieldName);
  } catch (error) {
    if (error instanceof ValidationError) {
      validator.showError(error);
    } else {
      throw error;
    }
  }
}

Object.keys(validator.fields).forEach(fieldName => {
  const field = validator.fields[fieldName];
  const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "blur";
  field.addEventListener(eventName, () => validateSingleField(fieldName));
});

messageInput.addEventListener("input", updateCharacterCount);

form.addEventListener("submit", event => {
  event.preventDefault();
  validator.clearErrors();
  formMessage.className = "form-message";
  formMessage.textContent = "";

  try {
    validator.validateAll();
    formMessage.classList.add("success");
    formMessage.textContent = "Registration submitted successfully!";
    form.reset();
    updateCharacterCount();
    validator.clearErrors();
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      formMessage.classList.add("error");
      formMessage.textContent = "An unexpected error occurred. Please try again.";
      console.error(error);
      return;
    }

    validator.showError(error);
    formMessage.classList.add("error");
    formMessage.textContent = "Please correct the highlighted field.";
    validator.fields[error.field].focus();
  }
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    validator.clearErrors();
    formMessage.className = "form-message";
    formMessage.textContent = "";
    updateCharacterCount();
  }, 0);
});

updateCharacterCount();
