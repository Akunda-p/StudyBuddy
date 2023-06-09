var express = require('express');
var router = express.Router();
import Joi from 'joi';
import { checkAuthID, createUser, getUserProfile, searchUser, updateUserProfile } from '../dao/user-dao'
import { IUser } from '../schema/user-schema';
import { ICourse } from '../schema/course_schema';
import jwtDecode, { JwtPayload } from "jwt-decode";
import { jwtDecodeUser } from '../auth/jwt';


const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;


// get search user result
router.get('/search/:keyword', async (req, res) => {
  const keywordValidate = Joi.string().required().validate(req.params.keyword)
  if (keywordValidate.error) {
    console.error(keywordValidate.error)
  } else {
    const userResult = await searchUser(keywordValidate.value)
    res.json(userResult)
  }

})

// update userProfile
router.patch('/profile/update', async (req, res, next) => {
  const authID = jwtDecodeUser(req.headers.authorization)
  const userDataValidate = Joi.object<IUser>({
    name: Joi.string().required(),
    uniID: Joi.string().required(),
    gender: Joi.string().required().allow(null, ''),
    email: Joi.string().required().allow(null, ''),
    faculty: Joi.string().required().allow(null, ''),
    major: Joi.string().required().allow(null, ''),
    authID: Joi.string().required(),
    userAvatar: Joi.string().required(),
    courses: Joi.array().items(
      Joi.object({
        course_code: Joi.string().required(),
        course_name: Joi.string().required(),
        CourseNName: Joi.string().required()
      }).unknown(true)
    ).required().allow(null, '')
  }).unknown(true).validate(req.body)
  if (userDataValidate.error) {
    console.error(userDataValidate.error)
  } else {
    const updatedUser = await updateUserProfile(authID, userDataValidate.value)
    res.json(updatedUser);
  }

});

// set pic
// router.patch('/:authID/pic',async (req, res, next) => {
//   res.json('aaaaaaaaaa');
// });

/* GET users listing. */
router.get('/getprofile', async (req, res, next) => {
  const authID = jwtDecodeUser(req.headers.authorization)
  const user = await getUserProfile(authID)
  res.json(user);
});

// Get users login Email
router.get('/authID/check', async (req, res, next) => {
  const authID = jwtDecodeUser(req.headers.authorization)
  const isHave: object = await checkAuthID(authID);
  res.send(isHave)

});

router.post("/api/register", async (req, res) => {
  try {
    const userDataValidate = Joi.object<IUser>({
      name: Joi.string().required(),
      uniID: Joi.string().required(),
      gender: Joi.string().required().allow(null, ''),
      email: Joi.string().required().allow(null, ''),
      faculty: Joi.string().required().allow(null, ''),
      major: Joi.string().required().allow(null, ''),
      authID: Joi.string().required(),
      userAvatar: Joi.string().required(),
    }).validate(req.body)
    if (userDataValidate.error) {
      console.error(userDataValidate.error)
    } else {
      const newUser = await createUser(userDataValidate.value)
      res.sendStatus(HTTP_CREATED)
      console.log(newUser)
    }
  } catch (err) {
    console.log(err)
    res.sendStatus(HTTP_BAD_REQUEST)
  }
})

module.exports = router;
