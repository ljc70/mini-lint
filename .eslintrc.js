module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "standard"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        wx: true,
        Page: true,
        getApp: true
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        parser: 'babel-eslint'
    },
    "rules": {
        "prefer-const": 0,
        "space-before-function-paren": 0,
        "quotes": ["error", "single", { "allowTemplateLiterals": true }]
    }
};