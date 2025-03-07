/**
 * Script.JS File | 
 * Contains the code for front end manipulation
 * and interactions with middleware
*/

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("search-btn")) {
            convertButtonToSearch(event.target);
        }

        // Handling the process for when the export button is pressed
        if (event.target.id === "exportBtn") {
            // Alert if there are no checkboxes selected
            if (!checkboxStatus()) {
                event.preventDefault();
                return
            }; 
            // Confirms with user if they want to proceed
            if (!confirm("Are you sure you want to export the selected CVEs?")) {
                event.preventDefault();
                return;
            }
            handleAction("export", "exportSelected");
        }

        // Handling the process for when the add favourite button is pressed
        if (event.target.id === "addFavBtn") {
            // Alert if there are no checkboxes selected
            if (!checkboxStatus()) {
                event.preventDefault();
                return
            }; 
            // Confirms with user if they want to proceed
            if (!confirm("Are you sure you want to add the selected CVEs to favourites?")) {
                event.preventDefault();
                return;
            }
            handleAction("favourite", "favSelected");
        }

        // Handling the process for when the remove favourites button is pressed
        if (event.target.id === "removeBtn") {
            // Alert if there are no checkboxes selected
            if (!checkboxStatus()) {
                event.preventDefault();
                return
            };
            // Confirms with user if they want to proceed
            if (!confirm("Are you sure you want to remove the selected CVEs?")) {
                event.preventDefault();
                return;
            }
            handleAction("remove", "removeSelected");
        }
    });

});

/** 
 * convertButtonToSearch function |
 * Handles the buttons related to search
 * by converting them into search fields when clicked
 */
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

/**
 * restoreButton Function |
 * This function restores the search fields back to buttons
 */
function restoreButton(input) {
    if (!input) return;
    
    const parent = input.parentNode;
    const button = document.createElement("button");
    button.id = input.dataset.buttonId; // Restore original button ID
    button.className = "search-btn btn btn-custom"; // Restore correct styling
    button.innerText = input.dataset.originalText; // Restore original button text
    
    parent.replaceChild(button, input);
}

function checkboxStatus(){
    const selectedVulns = Array.from(document.querySelectorAll(".vuln-checkbox"))
        .filter(checkbox => checkbox.checked);

    if(selectedVulns.length === 0){
        alert("Please select at least 1 CVE");
        return false;
    }
    return true;
}

function handleAction(formid, inputid) {
    const selectedVulns = Array.from(document.querySelectorAll(".vuln-checkbox"))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

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