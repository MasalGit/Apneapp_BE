import {
  //listAllEntries,
  findEntryById,
  addEntry,
  listAllEntriesByUserId,
  removeEntryById,
  updateEntry,
} from '../models/entry-model.js';

const getEntries = async (req, res) => {
  // haetaan kaikkien käyttäjien merkinnät
  //const result = await listAllEntries();
  // haetaan kirjautuneen (token) käyttäjän omat merkinnät
  const result = await listAllEntriesByUserId(req.user.user_id);
  if (!result.error) {
    res.json(result);
  } else {
    res.status(500);
    res.json(result);
  }
};

// haetaan yksittäinen merkintä ID:n perusteella
const getEntryById = async (req, res) => {
  const entry = await findEntryById(req.params.id);
  if (entry) {
    res.json(entry);
  } else {
    res.sendStatus(404);
  }
};

// lisätään uusi päiväkirjamerkintä tietokantaan
const postEntry = async (req, res) => {
  const {mood, weight, sleep_hours, notes} = req.body;
  const user_id = req.user.user_id;
  
  // tarkistetaan että vähintään yksi vapaaehtoinen kenttä on täytetty - AI-assisted
  if (!mood && !weight && !sleep_hours && !notes) {
    return res.status(400).json({message: 'Anna vähintään yksi arvo päivämäärän lisäksi'});
  }

  const result = await addEntry({user_id, ...req.body});
  if (result.entry_id) {
    res.status(201).json({message: 'New entry added.', ...result});
  } else {
    res.status(500).json(result);
  }
};

// päivitetään olemassa oleva merkintä ID:n perusteella - AI-assisted
const putEntry = async (req, res) => {
  const { entry_date, mood, weight, sleep_hours, notes } = req.body;
  const entryId = req.params.id;
  const userId = req.user.user_id;

  // vähintään yksi kenttä täytyy olla mukana
  if (!entry_date && !mood && !weight && !sleep_hours && !notes) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const result = await updateEntry(entryId, userId, { entry_date, mood, weight, sleep_hours, notes });
  if (result === true) {
    res.json({ message: 'Entry updated' });
  } else if (result.error) {
    res.status(500).json(result);
  } else {
    res.status(404).json({ message: 'Entry not found' });
  }
};

// poistetaan merkintä ID:n perusteella, vain oma merkintä
const deleteEntry = async (req, res) => {
  const affectedRows = await removeEntryById(req.params.id, req.user.user_id);
  if (affectedRows > 0) {
    res.json({message: 'entry deleted'});
  } else {
    res.status(404).json({message: 'entry not found'});
  }
};

export {getEntries, getEntryById, postEntry, putEntry, deleteEntry};
