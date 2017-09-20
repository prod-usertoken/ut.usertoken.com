const forge = require('node-forge');
const Gun = require('gun/gun');
const serialize = require('serialize-javascript');

// var gun = Gun(location.origin + '/gun');

const rsa = forge.pki.rsa;

const gun = Gun('/gun');
// Sync everything
gun.on('out', { get: { '#': { '*': '' } } });

const serverKey = gun.get('keys');

module.exports = (task, data) => {
    switch (task) {
        case 'genkey':
            rsa.generateKeyPair({ bits: data.bits, workers: data.workers }, (err, keypair) => {
                const key = serialize(keypair);
                const publickey = serialize(keypair.publicKey);
                const privatekey = serialize(keypair.privateKey);
                serverKey.get('serverkeys').put({ publickey: publickey, privatekey: privatekey });
                console.log('1.encryptionWorker task genkey publickey : ', publickey);
                console.log('2.encryptionWorker task genkey privatekey : ', privatekey);
            });
            break;
        case 'encrypt':
            break;
        default:
            break;
    }
}

///////////////////////
// supporting utils ///
///////////////////////