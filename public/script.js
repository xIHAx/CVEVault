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