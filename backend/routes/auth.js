const Router = require('express').Router;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbClient = require("../db");
const router = Router();

const createToken = () => {
  return jwt.sign({}, 'secret', { expiresIn: '1h' });
};

router.post('/login',async (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Check if user login is valid
  // If yes, create token and return it to client
  const client = await dbClient.getConnection();
  const result = await client.db().collection("users").findOne({
    email:email,
  })
  if(!result){
    res
    .status(401)
    .json({ message: 'Authentication failed, invalid username or password.' });
  }else{
    bcrypt.compare(pw,result.password).then(checkRes=>{
        if(checkRes){
          const token = createToken();
          res.status(200).json({ token: token, user: { email: email } });      
        }else{
          res
          .status(401)
          .json({ message: 'Authentication failed, invalid username or password.' });      
        }
    }).catch(err=>{
      console.log(err);
      res
      .status(401)
      .json({ message: 'Authentication failed, invalid username or password.' });  
    })
  }
});

router.post('/signup', async (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Hash password before storing it in database => Encryption at Rest
  bcrypt
    .hash(pw, 12)
    .then(async hashedPW => {
      // Store hashedPW in database
      const client = await dbClient.getConnection();
      await client.db().collection("users").insertOne({
        email:email,
        password:hashedPW
      })
      const token = createToken();
      res.status(201).json({ token: token, user: { email: email } });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Creating the user failed.' });
    });
  // Add user to database
});

module.exports = router;
