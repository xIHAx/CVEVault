// Function to transform a button into an input field (Only one search bar at a time)
function transformToInput(buttonId, inputId) {
    let button = document.getElementById(buttonId);
    let parent = button.parentNode;

    // Hide all other search bars and restore buttons
    let allSearchIds = ["cveSearch", "vendorSearch", "productSearch"];
    allSearchIds.forEach(id => {
        let existingInput = document.getElementById(id);
        if (existingInput) {
            restoreButton(id);
        }
    });

    // Create a new input field for the clicked button
    let input = document.createElement("input");
    input.type = "text";
    input.id = inputId;
    input.className = "search-input";
    input.placeholder = button.innerText + "...";
    input.onkeyup = function() { filterTable(allSearchIds.indexOf(inputId)) };

    // Replace the button with the input field
    parent.replaceChild(input, button);
    input.focus();

    // Add listener to revert input to button when clicking outside
    document.addEventListener('click', function revertOnClickOutside(event) {
        if (event.target !== input && event.target !== button) {
            restoreButton(inputId);
            document.removeEventListener('click', revertOnClickOutside);
        }
    });
}

// Helper function to restore the button from input field
function restoreButton(inputId) {
    let input = document.getElementById(inputId);
    if (!input) return;

    let btn = document.createElement("button");
    btn.id = inputId.replace("Search", "Btn");
    btn.className = "btn";

    if (inputId === 'cveSearch') btn.innerText = 'CVE ID Search';
    if (inputId === 'vendorSearch') btn.innerText = 'Vendor Search';
    if (inputId === 'productSearch') btn.innerText = 'Product Search';

    btn.onclick = function() { transformToInput(btn.id, inputId) };
    input.parentNode.replaceChild(btn, input);

    // Clear filter when restoring button
    filterTable(-1);  // Resets filtering
}

// Function to filter the Main CVE table based on the selected search category
function filterTable(columnIndex) {
    let table = document.getElementById("mainTable");
    let rows = table.getElementsByTagName("tr");

    // If columnIndex is -1, reset table to show all rows
    if (columnIndex === -1) {
        for (let i = 1; i < rows.length; i++) {
            rows[i].style.display = "";
        }
        return;
    }

    let inputId = ["cveSearch", "vendorSearch", "productSearch"][columnIndex];
    let input = document.getElementById(inputId);
    if (!input) return;

    let filterValue = input.value.toLowerCase();

    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].getElementsByTagName("td");
        let match = cells[columnIndex].innerText.toLowerCase().includes(filterValue);
        rows[i].style.display = match ? "" : "none";
    }
}

// Function to filter the favourites table
function filterFavouritesTable() {
    let input = document.getElementById("favouritesSearchInput");
    if (!input) return;

    let filterValue = input.value.toLowerCase();
    let table = document.getElementById("favouritesTable");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { // Skip header row
        let cells = rows[i].getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < cells.length - 1; j++) { // Exclude Action column
            if (cells[j].innerText.toLowerCase().includes(filterValue)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? "" : "none";
    }
}

// Function to transform button into input field for favourites page
function transformToInput(buttonId, inputId) {
    let button = document.getElementById(buttonId);
    let parent = button.parentNode;

    // Define IDs specifically for favourites page
    let allSearchIdsFav = ["cveSearchFav", "vendorSearchFav", "productSearchFav"];
    allSearchIdsFav.forEach(id => {
        let existingInput = document.getElementById(id);
        if (existingInput) {
            restoreButtonFav(id);
        }
    });

    let input = document.createElement("input");
    input.type = "text";
    input.id = inputId;
    input.className = "search-input";
    input.placeholder = button.innerText + "...";
    input.onkeyup = function() { filterFavouritesTableByColumn(allSearchIdsFav.indexOf(inputId)) };

    parent.replaceChild(input, button);
    input.focus();

    document.addEventListener('click', function revertOnClickOutsideFav(event) {
        if (event.target !== input && event.target !== button) {
            restoreButtonFav(inputId);
            document.removeEventListener('click', revertOnClickOutsideFav);
        }
    });
}

function restoreButtonFav(inputId) {
    let input = document.getElementById(inputId);
    if (!input) return;

    let btn = document.createElement("button");
    btn.id = inputId.replace("SearchFav", "SearchBtnFav");
    btn.className = "btn";

    if (inputId === 'cveSearchFav') btn.innerText = 'CVE ID Search';
    if (inputId === 'vendorSearchFav') btn.innerText = 'Vendor Search';
    if (inputId === 'productSearchFav') btn.innerText = 'Product Search';

    btn.onclick = function() { transformToInput(btn.id, inputId) };
    input.parentNode.replaceChild(btn, input);

    // Reset filtering when restoring button
    filterFavouritesTableByColumn(-1);
}

function filterFavouritesTableByColumn(columnIndex) {
    let table = document.getElementById("favouritesTable");
    let rows = table.getElementsByTagName("tr");

    if (columnIndex === -1) {
        for (let i = 1; i < rows.length; i++) {
            rows[i].style.display = "";
        }
        return;
    }

    let inputId = ["cveSearchFav", "vendorSearchFav", "productSearchFav"][columnIndex];
    let input = document.getElementById(inputId);
    if (!input) return;

    let filterValue = input.value.toLowerCase();

    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].getElementsByTagName("td");
        let match = cells[columnIndex].innerText.toLowerCase().includes(filterValue);
        rows[i].style.display = match ? "" : "none";
    }
}
