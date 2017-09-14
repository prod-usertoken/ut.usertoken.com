const forge = require('node-forge');
const rsa = forge.pki.rsa;

module.exports = (task, data, callback) => {
    switch(task) {
        case 'genkey':
            rsa.generateKeyPair({bits: data.bits, workers: data.workers}, (err, keypair) => {
                callback(keypair)
            });
            break;
        case 'encrypt':
            callback(data.payload);
            break;
        default:
            cb(task);
    }
}


