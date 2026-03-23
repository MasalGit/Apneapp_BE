import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {addUser, findUserByUsername, listAllUsers, findUserById, updateUser, removeUser} from '../models/user-model.js';


// TODO: getUserById - tehty minä ja Claude 
// TODO: putUserById - tehty minä ja Claude
// TODO: deleteUserById - tehty minä ja Claude


const getUsers = async (req, response) => {
  const users = await listAllUsers();
  response.json(users);
};


// Käyttäjän lisäys (rekisteröityminen)
const postUser = async (pyynto, vastaus) => {
  const newUser = pyynto.body;
  // Uusilla käyttäjillä pitää olla kaikki vaaditut ominaisuudet tai palautetaan virhe
  // itse koodattu erittäin yksinkertainen syötteen validointi
  if (!(newUser.username && newUser.password && newUser.email)) {
    return vastaus.status(400).json({error: 'required fields missing'});
  }
  // HUOM: ÄLÄ ikinä loggaa käyttäjätietoja ensimmäisten pakollisten testien jälkeen!!! (tietosuoja)
  //console.log('registering new user', newUser);

  // Lasketaan salasanasta tiiviste (hash)
  const hash = await bcrypt.hash(newUser.password, 10);
  //console.log('salasanatiiviste:', hash);
  // Korvataan selväkielinen salasana tiivisteellä ennen kantaan tallennusta
  newUser.password = hash;
  const newUserId = await addUser(newUser);
  vastaus.status(201).json({message: 'new user added', user_id: newUserId});
};


const postLogin = async (req, res) => {
  const {username, password} = req.body;
  // haetaan käyttäjä-objekti käyttäjän nimen perusteella
  const user = await findUserByUsername(username);
  //console.log('postLogin user from db', user);
  if (user) {
    // jos asiakkaalta tullut salasana vastaa tietokannasta haettua tiivistettä, ehto on tosi
    if (await bcrypt.compare(password, user.password)) {
      delete user.password;
      // generate & sign token using a secret and expiration time
      // read from .env file
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      return res.json({message: 'login ok', user, token});
    }
    return res.status(403).json({error: 'invalid password'});
  }
  res.status(404).json({error: 'user not found'});
};

// Get user information stored inside token
const getMe = (req, res) => {
  res.json(req.user);
};
// hae käyttäjä ID:n perusteella - AI-assisted
const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({message: 'Error fetching user'});
  }
};

// päivitä käyttäjän tiedot - vain oma profiili - AI-assisted
const putUser = async (req, res) => {
  const userId = req.params.id;
  const {username, email} = req.body;

  // tarkistetaan että käyttäjä muokkaa vain omaa profiiliaan
  if (req.user.user_id !== Number(userId)) {
    return res.status(403).json({message: 'Not authorized to update this user'});
  }

  try {
    const success = await updateUser(userId, {username, email});
    if (success) {
      res.json({message: 'User updated'});
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({message: 'Error updating user'});
  }
};

// poista käyttäjä - vain oma profiili - AI-assisted
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  // tarkistetaan että käyttäjä poistaa vain oman profiilinsa
  if (req.user.user_id !== Number(userId)) {
    return res.status(403).json({message: 'Not authorized to delete this user'});
  }

  try {
    const success = await removeUser(userId);
    if (success) {
      res.json({message: 'User deleted'});
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({message: 'Error deleting user'});
  }
};

export {getUsers, postUser, postLogin, getMe, getUserById, putUser, deleteUser};