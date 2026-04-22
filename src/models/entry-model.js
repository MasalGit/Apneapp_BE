// Note: db functions are async and must be called with await from the controller

import promisePool from '../utils/database.js';

const listAllEntries = async () => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM DiaryEntries');
    return rows;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const listAllEntriesByUserId = async (id) => {
  try {
    const sql = 'SELECT * FROM DiaryEntries WHERE user_id = ?';
    const [rows] = await promisePool.execute(sql, [id]);
    return rows;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const findEntryById = async (id) => {
  try {
    // prepared statement
    const [rows] = await promisePool.execute('SELECT * FROM DiaryEntries WHERE entry_id = ?', [id]);

    // turvaton tapa, mahdollistaa sql-injektiohaavoittuvuuden:
    //const [rows] = await promisePool.query('SELECT * FROM DiaryEntries WHERE entry_id =' + id);

    //console.log('rows', rows);
    return rows[0];
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

// lisätään uusi päiväkirjamerkintä tietokantaan
const addEntry = async (entry) => {
  const {user_id, entry_date, mood, weight, sleep_hours, notes} = entry;
  const sql = `INSERT INTO DiaryEntries (user_id, entry_date, mood, weight, sleep_hours, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [user_id, entry_date, mood, weight, sleep_hours, notes];
  try {
    const result = await promisePool.execute(sql, params);
    //console.log('insert result', result);
    return {entry_id: result[0].insertId};
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

// poistetaan päiväkirjamerkintä sen id:n perusteella
const removeEntryById = async (entryId, userId) => {
  const sql = 'DELETE from DiaryEntries WHERE entry_id = ? AND user_id = ?';
  const [result] = await promisePool.execute(sql, [entryId, userId]);
  //console.log('remove entry by id', result);
  return result.affectedRows;
};

// päivitetään päiväkirjamerkintä entry_id:n ja user_id:n perusteella
const updateEntry = async (entryId, userId, entry) => {
  const { entry_date, mood, weight, sleep_hours, notes } = entry;
  const sql = `UPDATE DiaryEntries 
               SET entry_date = ?, mood = ?, weight = ?, sleep_hours = ?, notes = ?
               WHERE entry_id = ? AND user_id = ?`;
  const params = [entry_date, mood, weight, sleep_hours, notes, entryId, userId];
  try {
    const [result] = await promisePool.execute(sql, params);
    return result.affectedRows > 0;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

export {listAllEntries, findEntryById, addEntry, listAllEntriesByUserId, removeEntryById, updateEntry};
