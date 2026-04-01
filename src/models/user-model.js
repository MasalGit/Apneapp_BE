import promisePool from '../utils/database.js';

// TODO: lisää modelit ja muokkaa kontrollerit reiteille:  - tehty, minä ja Calude
// GET /api/users - listaa kaikki käyttäjät
const listAllUsers = async () => {
  const sql = 'SELECT username, created_at FROM Users';
  const [rows] = await promisePool.query(sql);
  return rows;
};

// POST /api/users   lisää uusi käyttäjä
const addUser = async (user) => {
  const {username, password, email} = user;
  const sql = `INSERT INTO Users (username, password, email)
               VALUES (?, ?, ?)`;
  const params = [username, password, email];
  try {
    const result = await promisePool.execute(sql, params);
    return {user_id: result[0].insertId};
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const selectUserById = findUserById;

// GET /api/users/:id - hae käyttäjä ID:n perusteella - minä ja Claude
const findUserById = async (userId) => {
  const sql = 'SELECT user_id, username, email, created_at, user_level FROM Users WHERE user_id = ?';
  const [rows] = await promisePool.execute(sql, [userId]);
  return rows[0];
};

// PUT /api/users/:id - päivitä käyttäjän tiedot - minä ja Claude
const updateUser = async (userId, user) => {
  const {username, email} = user;
  const sql = `UPDATE Users SET username = ?, email = ? WHERE user_id = ?`;
  try {
    const [result] = await promisePool.execute(sql, [username, email, userId]);
    return result.affectedRows > 0;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};


// DELETE /api/users/:id - poista käyttäjä ID:n mukaan
const removeUser = async (userId) => {
  const sql = 'DELETE FROM Users WHERE user_id = ?';
  try {
    const [result] = await promisePool.execute(sql, [userId]);
    return result.affectedRows > 0;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const selectUserByEmail = async (email) => {
  try {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    const [rows] = await promisePool.execute(sql, [email]);
    // Jos riviä ei löydy, palautetaan error-objekti opettajan koodia varten
    if (rows.length === 0) return { error: 'User not found' };
    return rows[0];
  } catch (e) {
    console.error('error', e.message);
    return { error: e.message };
  }
};

// lisätty virheenkäsittely minä ja Claude
const findUserByUsername = async (username) => {
  try {
    const sql = 'SELECT * FROM Users WHERE username = ?';
    const [rows] = await promisePool.execute(sql, [username]);
    return rows[0];
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};




export {findUserByUsername, addUser, listAllUsers, findUserById, selectUserById, selectUserByEmail, updateUser, removeUser };
