const workerFarm = require('worker-farm');
const serialize = require('serialize-javascript');

const Gun = require('../models/gundb');
const { gun } = Gun;

const FARM_OPTIONS = {
    maxConcurrentWorkers: require('os').cpus().length,
    maxCallsPerWorker: Infinity,
    maxConcurrentCallsPerWorker: 1
};
// Sync everything
gun.on('out', { get: { '#': { '*': '' } } });
const serverKey = gun.get('keys');

const workers = workerFarm(FARM_OPTIONS, require.resolve('./workers/encryptionWorker'))

exports.genKeys = (req, res) => {
    for (i = 1; i < 2; i++) {
        work('genkey', { bits: 2048, workers: 2 });
    };
    res.status(200).send('genkey');
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

const work = (task, data, db) => workers(task, data, db);
