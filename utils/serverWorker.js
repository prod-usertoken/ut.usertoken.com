const workerFarm = require('worker-farm');
const serialize = require('serialize-javascript');

const Gun = require('gun');
require('gun/lib/path.js');
const gun = Gun(['//gun']);

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
    for (i = 1; i < 20; i++) {
      const data = { bits: 2048, workers: 2, task: 'genkey', index: i};
      work(data, (workerKey) => {
        key1 = deserialize(workerKey).publicKey;
        // console.log('0.serverWorker worker publickey : ', key1);
        serverKey.get('serverkeys').get('publickey').val(key => {
          // console.log('1.serverWorker serverWorker publickey : ', key);
        });
        keyIndex.get('1').get('publickey').val(key => {
          // console.log('2.serverWorker serverWorker index publickey : ', key);
        });
      });
    };
    res.status(200).send(JSON.stringify('genkey'));
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

const work = (task, cb) => workers(task, cb);
