const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')
const Gun = require('gun')
require('dotenv').config()

const port = parseInt(process.env.PORT, 10) || 9000
const dev = process.env.NODE_ENV === 'dev'
const app = next({ dev })
const handle = app.getRequestHandler()

const { genKeys } = require('./utils/serverWorker')

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

  server.get('/login/:user', (req, res) => {
    const user = req.params.user;
    console.log('1.server GET /login/user : ', user)
    res.status(200).send('user : ' + JSON.stringify(user));
  })

  server.post('/login/user', (req, res) => {
    const user = req.body.userId;
    console.log('1.server POST /login/user : ', user)
    res.status(200).send('user : ' + JSON.stringify(user));
  })

  server.get('/api/genkeys', (req, res) => genKeys(req, res));
  ///////////////////////////////
  server.get('/a', (req, res) => {
    return app.render(req, res, '/b', req.query)
  })

  server.get('/b', (req, res) => {
    return app.render(req, res, '/a', req.query)
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
