const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')
const Gun = require('gun')
const md5 = require("blueimp-md5")
require('dotenv').config()

const port = parseInt(process.env.PORT, 10) || 9000
const dev = process.env.NODE_ENV === 'dev'
const app = next({ dev })
const handle = app.getRequestHandler()

const { genKeys, getKeys } = require('./utils/serverWorker')

console.log('next : ', dev);
app.prepare()
.then(() => {
  const server = express()
  const gunOptions = {
    file: 'data.json',
    web: server,
    s3: {
        key: '', // AWS Access Key
        secret: '', // AWS Secret Token
        bucket: '' // The bucket you want to save into
    }
  }
  const gun = new Gun(gunOptions)
  server.use(Gun.serve)
  server.use(bodyParser.json()); // support json encoded bodies
  server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  ///////////////////////////////
  server.get('/gun', (req, res) => {
    if(Gun.serve(req, res)){
        console.log('['+ new Date()+'] : - Gun served -');
      };
    res.redirect('/');
    return
  })

  server.get('favicon', (req, res) => {
    return app.render(req, res, '/favicon', req.query)
  })

  server.get('/login/:id', (req, res) => {
    const id = req.params.id;
    console.log('1.server GET /login/id : ', id)
    res.status(200).send('id : ' + JSON.stringify(id));
    return
  })

  server.post('/login', (req, res) => {
    const id = req.body.id;
    console.log('1.server POST /login : ', id)
    res.status(200).send('id : ' + JSON.stringify(id));
    return
  })

  server.get('/api/getkeys/:id', (req, res) => {
    getKeys(req, res);
    const serverKey = gun.get('keys');
    const keyIndex = gun.get('keyindex');

    const id = req.params.id;
    console.log('1.server getKeys id : ', id);
    keyIndex.get(id).get('publickey').val(key => {
      const md5Key = md5(key);
      console.log('2.server getKeys : ', md5Key);
    });
  });
  ///////////////////////////////
  // home page
  server.get('/about', (req, res) => {
    return app.render(req, res, '/about', req.query)
  })

  // server.get('/b', (req, res) => {
  //   return app.render(req, res, '/a', req.query)
  // })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
    setTimeout(genKeys, 2000)
  })
})
