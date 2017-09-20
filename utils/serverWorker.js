const workerFarm = require('worker-farm');
const serialize = require('serialize-javascript');

const Gun = require('gun');
require('gun/lib/path.js');
const gun = Gun(['http://localhost:3000/gun']);

const FARM_OPTIONS = {
    maxConcurrentWorkers: require('os').cpus().length,
    maxCallsPerWorker: Infinity,
    maxConcurrentCallsPerWorker: 1
};
// Sync everything
gun.on('out', { get: { '#': { '*': '' } } });
const serverKey = gun.get('keys');
const keyIndex = gun.get('keyindex');

const workers = workerFarm(FARM_OPTIONS, require.resolve('./workers/encryptionWorker'))

exports.genKeys = (req, res) => {
    let key1;
    // for (i = 1; i < 2; i++) {
      // const data = { bits: 2048, workers: 2 };
      work('genkey');
    // };
    serverKey.get('serverkeys').get('publickey').val(key => {
      // console.log('1.serverWorker publickey : ', key);
      key1 = key;
    });
    keyIndex.get('1').get('publickey').val(key => {
      console.log('2.serverWorker publickey : ', key === key1);
    });
    res.status(200).send('1');
    return
};

exports.getkey = (req, res) => {
    serverKey.get('serverkeys').get('publickey').val(key => {
        console.log('1.encryptionWorker task getkey : ', key);
        res.status(200).send(key);
    });
    return
};

exports.encrypt = (req, res) => {
    res.status(200).send('encrypt');
    return
};
//////////////////////////
// supporting functions //
//////////////////////////

// function deserialize(serializedJavascript){
//   return eval('(' + serializedJavascript + ')');
// };

const deserialize = (serializedJavascript) => eval('(' + serializedJavascript + ')');

const work = (task) => workers(task);
