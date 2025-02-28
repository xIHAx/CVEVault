const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let favourites = []; // Store favourite vulnerabilities (to be handled by MongoDB backend)

// Home Route
app.get("/", (req, res) => {
    res.render("main", { vulnerabilities: [] });
});

// Favourites Page
app.get("/favourites", (req, res) => {
    res.render("favourites", { favourites });
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});

// Sign Up Page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Add item to favourites
app.post("/add-favourite", (req, res) => {
    const cveId = req.body.cveId;
    if (!cveId) {
        return res.status(400).send("Invalid request: Missing CVE ID");
    }
    
    const selectedVuln = {}; // Placeholder, MongoDB will handle this

    if (!favourites.find(fav => fav.id === cveId)) {
        favourites.push(selectedVuln);
    }
    res.redirect("/favourites");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
