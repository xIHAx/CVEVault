const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');

let users = [];

//For Login page

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async(req, res) => {
    const{email, password} = req.body;

    const user = users. find(u => u.email === email);
    if (!user){
        return res.send('Email does not exist')
    }

    try {
        const matchPass = await bcrypt.compare(password, user.password);
        if(matchPass) {
            req.session.user = user;
            res.send('Logged in successfully');
        }
        else {
            res.send('Incorrect password/email. Please re type either password or email')
        }
    }
    catch(err){
        console.error(err);
        res.send('Error during login. Please try again')
    }

})

//Should password be forgotten
router.get('/forgot_pass', (req, res) => {
    res.render('forgot_pass');
});

router.post('/forgot_pass', (req, res) => {
    const {email} = req.body;
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.send('No account with that email exists. Please try signing up');
    }

    crypto.randomBytes(20, (err, buffer) => {
        if (err) {
            console.error(err);
            return res.send('Error generating token');
        }
        const token = buffer.toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 360000;

        console.log(``)
        res.send('')
    })
});

router.get('/reset_pass/:token', (req, res) => {
    const token = req.params.token;
    const user = users.find(u => u.resetToken === token && u.resetTokenExpiration > Date.now());
    if (!user) {
        return res.send('Password reset token is invalid or expired');
    }
    res.render('reset-password', {token});
})

router.post('/reset_pass', async(req, res) => {
    const {token, password} = req.body;
    const user = users.find(u => u.resetToken === token && u.resetTokenExpiration > Date.now());
    if(!user) {
        return res.send('password reset token is invalid or has expired.');
    }

try {
    const hashedPass = await bcrypt.hash(password, 10);
    users.password = hashedPass;
    delete user.resetToken;
    delete user.resetTokenExpiration;

    res.send('Password successfully updated!')
}
catch (err){
    console.error(err);
    res.send('Error resetting password');
}
})

//For Signup page

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async(req, res) => {
    const {email, password}= req.body;

    //Checks if there is an email that preexists
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.send('User already exists')
    }

    try {
        const hashedPass = await bcrypt.hash(password, 10);
        users.push({email, password: hashedPass});
        console.log('User signed up:', email);
        res.redirect('/login')
    }
    catch (err) {
        console.error(err);
        res.send('Error. Please try signing up again')
    }
})

module.exports = router;