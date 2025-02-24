const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let favourites = []; // Store favourite vulnerabilities

// Route to render the Main Page 
app.get("/", (req, res) => {
  res.render("main", { vulnerabilities: [] }); 
});

// Route to render the Favourites Page
app.get("/favourites", (req, res) => {
  res.render("favourites", { favourites });
});

// Add item to favourites
app.post("/add-favourite", (req, res) => {
  const cveId = req.body.cveId;

  const selectedVuln = {}; // Placeholder - should be fetched from the backend

  if (selectedVuln && !favourites.find((f) => f.id === cveId)) {
    favourites.push(selectedVuln);
  }
  res.redirect("/favourites");
});

// Remove item from favourites
app.post("/remove-favourite", (req, res) => {
  const cveId = req.body.cveId;
  favourites = favourites.filter((f) => f.id !== cveId);
  res.redirect("/favourites");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
