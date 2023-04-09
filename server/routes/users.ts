var express = require('express');
var router = express.Router();
import {checkAuthID, createUser,getUserProfile, updateUserProfile} from '../dao/user-dao'


const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;



// update userProfile
router.patch('/:authID', async (req, res, next) => {
  const updatedUser = await updateUserProfile(req.params.authID,req.body)
  res.json(updatedUser);
});


/* GET users listing. */
router.get('/:uniID', async (req, res, next) => {

  const user = await getUserProfile(req.params.uniID)

  res.json(user);
});

// Get users login Email
router.get('/authID/:authID', async (req, res, next) => {
  const isHave: object = await checkAuthID(req.params.authID);
  console.log(isHave)
  res.send(isHave)

});



router.post("/register", async (req, res) => {
  try {
    const user: {
      name: string,
      uniID: string,
      gender: string,
      email: string,
      faculty: string,
      major: string,
      authID:string,
    } = {
      name: req.body.name,
      uniID: req.body.uniID,
      gender: req.body.gender,
      email: req.body.email,
      faculty: req.body.faculty,
      major: req.body.major,
      authID: req.body.authID,
    }
    if(user.name && user.uniID){
      const newUser = await createUser(user)
      res.sendStatus(HTTP_CREATED)
    }else{
      res.json("User name or UniID cannot be empty!")
    }
  } catch(err) {
    console.log(err)
    res.sendStatus(HTTP_BAD_REQUEST)
  }
})

module.exports = router;
