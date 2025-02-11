const express = require('express');
const session = require('express-session');
const authorisation = require('./routes/authorise');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: '',
    resave: false,
    saveUninitialized: false,
}));

app.use('/', authorisation);


app.get('/', (req, res) => {
    res.send()
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
