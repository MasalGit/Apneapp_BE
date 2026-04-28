import {findUserById, updateUser, removeUser} from '../models/user-model.js';

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

export {getUserById, putUser, deleteUser};