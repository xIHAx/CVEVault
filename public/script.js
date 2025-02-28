document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("search-btn")) {
            convertButtonToSearch(event.target);
        }
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
