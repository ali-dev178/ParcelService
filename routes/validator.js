const { body, validationResult } = require('express-validator');
const User = require("../models/userModel");
const userRegisterValidationRules = () => {
    return [
        // email
        body('email').exists().isEmail().withMessage('Please enter a valid email address')
        .custom(value => {
            return User.findOne({email: value}).then(user => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            });
        }),
        
        // password
        body('password').exists().isLength({ min: 5 }).withMessage('must be at least 5 chars long')
        .matches(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i).withMessage('must be alphanumeric'),
        
        // password confirmation
        body('passwordCheck').exists().custom((value, { req }) => {
            return value !== req.body.password ? false : true;
        }).withMessage('Password confirmation does not match password'),
    ]
}

const userLoginValidationRules = () => {
    return [
        //email
        body('email').exists().isEmail().withMessage('Please enter a valid email address')
        .custom(value => {
            return User.findOne({email: value}).then(user => {
                if (!user) {
                    return Promise.reject('No account with this E-mail has been registered');
                }
            });
        }),

        // password
        body('password').exists().withMessage('Please enter password')
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
}

module.exports = { userRegisterValidationRules, userLoginValidationRules, validate };