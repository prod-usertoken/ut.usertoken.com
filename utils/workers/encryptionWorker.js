const forge = require('node-forge');
const Gun = require('gun');
const serialize = require('serialize-javascript');

// var gun = Gun(location.origin + '/gun');

const rsa = forge.pki.rsa;

const gun = Gun('http://localhost:9000/gun');
// Sync everything
gun.on('out', { get: { '#': { '*': '' } } });

const serverKey = gun.get('keys');
const keyIndex = gun.get('keyindex');

module.exports = (task, options) => {
    const data = deserialize(options);
    switch (task) {
        case 'genkey':
          for(keyindex=1;keyindex<3;keyindex++) {
            rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, keypair) => {
                const key = serialize(keypair);
                const publickey = serialize(keypair.publicKey);
                const privatekey = serialize(keypair.privateKey);

                serverKey.get('serverkeys').put({ publickey: publickey, privatekey: privatekey });

                keyIndex.get(keyindex).put({ publickey: publickey });
                // console.log('1.encryptionWorker task genkey publickey : ', publickey);
                // console.log('2.encryptionWorker task genkey privatekey : ', privatekey);
                serverKey.get('serverkeys').get('publickey').val(key => {
                  console.log('3.encryptionWorker publickey : ', keyindex, key === publickey);
                });
            });
          }
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
const deserialize = (serializedJavascript) => eval('(' + serializedJavascript + ')');
