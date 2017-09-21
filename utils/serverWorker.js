const workerFarm = require('worker-farm');
const serialize = require('serialize-javascript');
const md5 = require("blueimp-md5");

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

const workers = workerFarm(FARM_OPTIONS, require.resolve('./workers/encryptionWorker'))
const keyCount = 20;

exports.genKeys = () => {
    for (keyindex = 1; keyindex < (keyCount + 1); keyindex++) {
      // console.log('1.serverWorker genKeys : ', keyindex);
      const data = { task: 'genkey', keyindex: keyindex, bits: 2048, workers: 2};
      work(data, (serverkey) => {
        const serverKey = gun.get('keys');
        const keyIndex = gun.get('keyindex');

        const md5key = md5(serverkey);
        const key = deserialize(serverkey);
        const publickey = serialize(key.publicKey);

        // const privatekey = serialize(key.privateKey);
        // update gundb with public key
        // console.log('2.serverWorker genKeys keyindex : ', data.keyindex);
        keyIndex.get(data.keyindex).put({ publickey: publickey, signature: md5key });
        // update gundb private key - to be replaced with firebase
        // todo : hash(serverkey) => serverHashkey
        //        firebaseSave({incoming_device_uuid: serverHashkey})
        //        firebaseSave({ serverkey: serverkey, keyindex: keyindex, serverHashkey: serverHashkey })

        serverKey.get('serverkeys').put({ serverkey: serverkey, keyindex: data.keyindex, signature: md5key });

        // const key1 = deserialize(workerKey).publicKey;
        // console.log('0.serverWorker worker publickey : ', key1);
        // serverKey.get('serverkeys').get('publickey').val(key => {
        //   // console.log('1.serverWorker serverWorker publickey : ', key);
        // });
        // keyIndex.get('1').get('publickey').val(key => {
        //   // console.log('2.serverWorker serverWorker index publickey : ', key);
        // });
      });
    };
    // res.status(200).send(JSON.stringify('genkey'));
    return
};

exports.getKeys = (req, res) => {
  const serverKey = gun.get('keys');
  const keyIndex = gun.get('keyindex');

  const id = req.params.id;
  // console.log('1.serverWorker getKeys id : ', id);
  // serverkey calculate MD5
  serverKey.get('serverkeys').get('serverkey').val(key => {
    const md5Key = md5(key);
    console.log('1.serverWorker getKeys serverkey : ', md5Key);
  });
  // server stored signature MD5
  keyIndex.get(id).get('signature').val(md5Key => {
    console.log('2.serverWorker getKeys signature : ', md5Key);
    res.status(200).send(JSON.stringify(md5Key));
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
