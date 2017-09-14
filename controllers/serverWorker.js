const workerFarm = require('worker-farm');
const serialize = require('serialize-javascript');

const Gun = require('../models/gundb');

const FARM_OPTIONS = {
          maxConcurrentWorkers        : require('os').cpus().length
        , maxCallsPerWorker           : Infinity
        , maxConcurrentCallsPerWorker : 1
      };

const workers = workerFarm(FARM_OPTIONS, require.resolve('./workers/encryptionWorker'))

exports.genKeys = (req, res) => {
    const { gun } = Gun;
    const serverKey = gun.get('keys');

    workers('genkey', {bits: 2048, workers: 2}, (pkiKey) => {
        const priKey = pkiKey.privateKey;
        const pubKey = pkiKey.publicKey;
        const output = serialize(pubKey);

        serverKey.put({ pubkey: output });

//        console.log(output);
        res.status(200).send(output);
    });
};

exports.encrypt = (req, res) => {
    const { gun } = Gun;
    const serverKey = gun.get('keys');

    serverKey.get('pubkey').val(key => {
        const pubKey = deserialize(key);
        const payload = pubKey;
        // console.log('pubkey: ', pubKey);
        workers('encrypt', {pubkey: pubKey, payload: payload} , (encData) => {
            const output = serialize(encData);
 //           console.log(output);
            res.status(200).send(output);
        });
    });
};

function deserialize(serializedJavascript){
  return eval('(' + serializedJavascript + ')');
}

