document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("search-btn")) {
            convertButtonToSearch(event.target);
        }

        if (event.target.id === "exportBtn") {
            confirm("Are you sure you want to export the selected CVEs?");
            handleAction("export", "exportSelected");
        }

        if (event.target.id === "addFavBtn") {
            confirm("Are you sure you want to add the selected CVEs to favourites?");
            handleAction("favourite", "favSelected");
        }

        if (event.target.id === "removeBtn") {
            confirm("Are you sure you want to remove the selected CVEs?");
            handleAction("remove", "removeSelected");
        }
    });

});

document.addEventListener("DOMContentLoaded", () => {
    const passwordField = document.getElementById("password");
    const strengthBar = document.getElementById("passwordStrengthBar");

    const checks = {
        length: document.getElementById("lengthCheck"),
        uppercase: document.getElementById("uppercaseCheck"),
        lowercase: document.getElementById("lowercaseCheck"),
        number: document.getElementById("numberCheck"),
        special: document.getElementById("specialCharCheck"),
    };

    passwordField.addEventListener("input", () => {
        const password = passwordField.value;
        let strength = 0;

        // Criteria Checks
        updateCheck(checks.length, password.length >= 8, "At least 8 characters", strength += password.length >= 8 ? 20 : 0);
        updateCheck(checks.uppercase, /[A-Z]/.test(password), "At least one uppercase letter", strength += /[A-Z]/.test(password) ? 20 : 0);
        updateCheck(checks.lowercase, /[a-z]/.test(password), "At least one lowercase letter", strength += /[a-z]/.test(password) ? 20 : 0);
        updateCheck(checks.number, /\d/.test(password), "At least one number", strength += /\d/.test(password) ? 20 : 0);
        updateCheck(checks.special, /[!@#$%^&*(),.?":{}|<>]/.test(password), "At least one special character", strength += /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 20 : 0);

        // Update Strength Bar
        strengthBar.style.width = `${strength}%`;
        strengthBar.className = "progress-bar"; // Reset classes
        strengthBar.classList.add(strength < 40 ? "bg-danger" : strength < 80 ? "bg-warning" : "bg-success");
    });

    function updateCheck(element, isValid, message, strengthValue) {
        element.innerHTML = (isValid ? "✅" : "❌") + " " + message;
        element.classList.toggle("text-success", isValid);
        element.classList.toggle("text-danger", !isValid);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector("form[action='/signup']");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");
    const passwordMessage = document.createElement("small");

    passwordMessage.classList.add("text-danger", "d-block", "mt-1");
    confirmPasswordField.insertAdjacentElement("afterend", passwordMessage);

    // Function to check password match
    function checkPasswordMatch() {
        const password = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();

        if (password.length === 0 || confirmPassword.length === 0) {
            passwordMessage.textContent = ""; // Clear message if fields are empty
            return false;
        }

        if (password !== confirmPassword) {
            passwordMessage.textContent = "❌ Passwords do not match!";
            return false;
        } else {
            passwordMessage.textContent = "✅ Passwords match!";
            passwordMessage.classList.add("text-success");
            return true;
        }
    }

    // Check passwords on input
    passwordField.addEventListener("input", checkPasswordMatch);
    confirmPasswordField.addEventListener("input", checkPasswordMatch);

    // Prevent form submission if passwords don’t match
    signupForm.addEventListener("submit", (event) => {
        if (!checkPasswordMatch()) {
            event.preventDefault();
            alert("Please ensure your passwords match before signing up.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");
    const passwordMessage = document.getElementById("passwordMessage");
    const confirmPasswordMessage = document.getElementById("confirmPasswordMessage");
    const messageContainer = document.getElementById("messageContainer");

    if (!forgotPasswordForm) return; // Ensure form exists before adding event listener

    forgotPasswordForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent page reload on form submission

        // Clear previous messages
        passwordMessage.textContent = "";
        confirmPasswordMessage.textContent = "";
        messageContainer.innerHTML = "";

        const password = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();

        // Validate password length
        if (password.length < 8) {
            passwordMessage.textContent = "Password must be at least 8 characters.";
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            confirmPasswordMessage.textContent = "Passwords do not match!";
            return;
        }

        messageContainer.innerHTML = `<div class="alert alert-success text-center">Password reset successfully! Redirecting to login...</div>`;

        // Redirect to login after delay
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
    });
});


function convertButtonToSearch(button) {
    if (!button) return;
    
    const parent = button.parentNode;
    const inputId = button.id.replace("Btn", "Search");
    
    // Reset other search inputs
    document.querySelectorAll(".search-input").forEach(input => {
        restoreButton(input);
    });

    // Create and replace button with input
    const input = document.createElement("input");
    input.type = "text";
    input.id = inputId;
    input.className = "search-input form-control";
    input.placeholder = button.innerText + "...";
    input.dataset.originalText = button.innerText; // Store original button text
    input.dataset.buttonId = button.id; // Store original button ID
    input.addEventListener("keyup", () => filterTable(inputId));
    
    parent.replaceChild(input, button);
    input.focus();

    // Restore button when clicking outside
    document.addEventListener("click", function revertOnClickOutside(event) {
        if (!input.contains(event.target) && event.target !== button) {
            restoreButton(input);
            document.removeEventListener("click", revertOnClickOutside);
        }
    });
}

function restoreButton(input) {
    if (!input) return;
    
    const parent = input.parentNode;
    const button = document.createElement("button");
    button.id = input.dataset.buttonId; // Restore original button ID
    button.className = "search-btn btn btn-custom"; // Restore correct styling
    button.innerText = input.dataset.originalText; // Restore original button text
    
    parent.replaceChild(button, input);
}

function handleAction(formid, inputid) {
    const selectedVulns = Array.from(document.querySelectorAll(".vuln-checkbox"))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)

    if (selectedVulns.length === 0) {
        alert("Please select at least 1 CVE");
        return;
    }

    // Set input to selected cves
    document.getElementById(inputid).value = JSON.stringify(selectedVulns);

    // Submitting the form of the button
    document.getElementById(formid).submit();
}

function filterTable(inputId) {
    const input = document.getElementById(inputId);
    const searchTerm = input.value.toLowerCase().trim();
   
    const table = document.getElementById('mainTable') ||
                  document.getElementById('favouritesTable');
    const rows = table.querySelectorAll('tbody tr');

    // If search term is empty, show all rows
    if (searchTerm === '') {
        rows.forEach(row => {
            row.style.display = '';
        });
        return;
    }

    rows.forEach(row => {
        let shouldShow = false;
        switch(inputId) {
            case 'cveSearch':
                filteredRows = row.cells[0].textContent.toLowerCase().includes(searchTerm);
                break;
            case 'vendorSearch':
                // More flexible search for vendor
                filteredRows = row.cells[1].textContent.toLowerCase().includes(searchTerm);
                break;
            case 'productSearch':
                // More flexible search for product
                filteredRows = row.cells[2].textContent.toLowerCase().includes(searchTerm);
                break;
        }
        row.style.display = filteredRows ? '' : 'none';
    });
}