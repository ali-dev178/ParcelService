const router = require("express").Router();
const { userRegisterValidationRules, userLoginValidationRules, validate } = require("./validator");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.post("/register", userRegisterValidationRules(), validate, async (req, res) => {
    let {email, password, passwordCheck, display_name} = req.body;
    if (!display_name) display_name = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
        email, password: passwordHash, display_name,
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
});

router.post("/login", userLoginValidationRules(), validate, async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({password: "Invalid Password/Credentials"});

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
        token,
        user: {
            id: user._id,
            display_name: user.display_name,
            email: user.email
        }
    })
});

router.delete('/delete', auth, async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.user);
        res.json(deleteUser);
    } catch {
        res.status(500).json({ error: err.message });
    }
});

router.post('/tokenIsValid', async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if(!token) return res.json(false);
        
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if(!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if(!user) return res.json(false);

        return res.json(true);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;