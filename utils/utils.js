/**
 * utils.js File |
 * Contains functions that are used in routes
 * to facilitate certain procedures
 */

/** 
 * Function for the cleaning of descriptions
 */
function filterCveContent(desc, cwes, cpes) {

    // Return null if cve is rejected
    if (desc.includes('Rejected reason:')) {
        return null;
    }

    // Filtering out Product information in the description
    let filterDesc = desc.replace(/Product:\s*.*/, '').trim();

    // Filtering noinfo/other CWE to "-"
    const filteredCwe = cwes.map(cwe => 
        cwe === 'NVD-CWE-noinfo' || cwe === 'NVD-CWE-Other' ? '-' : cwe
    );

    const vendors = [];
    const products = [];
    const vendorDupe = new Set();

    // Looping through the CPEs data for Vendor & Product information
    if (cpes && cpes.length > 0) {
        cpes.forEach(cpe => {
            
            // Checks for vendor duplication and adds to vendor array if no dupes
            if(!vendorDupe.has(cpe.vendor)) {
                vendorDupe.add(cpe.vendor);
                vendors.push(cpe.vendor);
            }

            // Filters "-" versions to be blank
            if(cpe.version === '-'){
                cpe.version = '';
            }

            // Pushes the product information into the products array
            products.push(`${cpe.product} ${cpe.version}`);
        });
    }

    // Sets vendor to "-" if there are none
    if (vendors.length === 0){
        vendors.push('-');
    }

    // Sets products to "-" if there are none
    if (products.length === 0){
        products.push('-');
    }

    // Returning the filtered information
    return {
        filterDesc,
        filteredCwe,
        products,
        vendors
    }
}

/** 
 * isLoggedIn Function | 
 * Checks if user is logged in for routers
 */
function isLoggedIn(req, res, next) {
    // If there is a user logged in allow router to proceed
    if (req.session && req.session.userid) {
        next();
    } else {
        // If there is no user logged in alert the current user and redirect to login page
        return res.send(`
            <script>
                alert("Please login to use this feature");
                window.location.href = "/login";
            </script>
        `);
    }
}

module.exports = {filterCveContent, isLoggedIn}