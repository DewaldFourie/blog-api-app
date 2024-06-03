const crypto = require('crypto');

// function to create a new password using crypto
function genPassword(password) {
    // creates a random 32-byte salt using crypto.randomBytes and converts to a hexadecimal string
    // (Salt is used to ensure that even identical passwords will have different hashes)
    var salt = crypto.randomBytes(32).toString('hex');
    // creates a hash using the PBKDF2 algorithm and converts it to a string
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    // returns the object containing the salt and generated hash
    return {
        salt: salt,
        hash: genHash,
    };
}

// function to validate a password using crypto
function validPassword(password, hash, salt) {
    // creates a hash for generated password and salt using the same params as GenPassword
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    // compare the generated hash (hashVerify) with the stored hash
    // if match, returns tue, else false
    return hash === hashVerify;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;