// AI-assisted: koko tiedosto toteutettu AI:n avulla opettajan entry-controller.js -rakennetta mallina käyttäen
import {
  getBloodPressureByUserId,
  getBloodPressureEntry,
  getBloodPressuresByDate,
  getBloodPressuresByRange,
  addBloodPressure,
  updateBloodPressure,
  deleteBloodPressure,
} from '../models/bloodpressure-model.js';

// haetaan kaikki käyttäjän mittaukset, tai suodatetaan päivämäärän/aikavälin mukaan
const getBloodPressures = async (req, res) => {
  const userId = req.user.user_id;
  const { date, from, to } = req.query; // haetaan query-parametrit URL:sta

  try {
    let result;
    if (date) {
      // ?date=2026-03-01
      result = await getBloodPressuresByDate(userId, date);
    } else if (from && to) {
      // ?from=2026-03-01&to=2026-03-07
      result = await getBloodPressuresByRange(userId, from, to);
    } else {
      // kaikki mittaukset
      result = await getBloodPressureByUserId(userId);
    }
    res.json(result);
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({ message: 'Error fetching blood pressures' });
  }
};

// haetaan yksittäinen mittaustulos ID:n perusteella
const getBloodPressureById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const result = await getBloodPressureEntry(id, userId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: 'Entry not found or not authorized' });
    }
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({ message: 'Error fetching blood pressure entry' });
  }
};

// lisätään uusi verenpainemittaus tietokantaan
const postBloodPressure = async (req, res) => {
  const { systolic, diastolic, pulse, measured_at, notes } = req.body;

  // validointi: ylä- ja alapaine ovat pakollisia
  if (!systolic || !diastolic) {
    return res.status(400).json({ message: 'Systolic and diastolic values are required' });
  }

  try {
    const result = await addBloodPressure({
      user_id: req.user.user_id,
      systolic,
      diastolic,
      pulse: pulse || null,
      measured_at: measured_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
      notes: notes || null,
    });

    res.status(201).json({ message: 'New blood pressure entry added', id: result.bp_id });
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({ message: 'Error saving blood pressure' });
  }
};

// päivitetään olemassa oleva mittaustulos ID:n perusteella
const putBloodPressure = async (req, res) => {
  const { id } = req.params;
  const { systolic, diastolic, pulse, notes } = req.body;
  const userId = req.user.user_id;

  if (!systolic || !diastolic) {
    return res.status(400).json({ message: 'Systolic and diastolic values are required' });
  }

  try {
    const success = await updateBloodPressure(id, userId, {
      systolic,
      diastolic,
      pulse: pulse || null,
      notes: notes || null,
    });

    if (success) {
      res.json({ message: 'Blood pressure entry updated' });
    } else {
      res.status(404).json({ message: 'Entry not found or not authorized' });
    }
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({ message: 'Error updating blood pressure' });
  }
};

// poistetaan mittaus ID:n perusteella
const deleteBloodPressureEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const success = await deleteBloodPressure(id, userId);

    if (success) {
      res.json({ message: 'Blood pressure entry deleted' });
    } else {
      res.status(404).json({ message: 'Entry not found or not authorized' });
    }
  } catch (e) {
    console.error('error', e.message);
    res.status(500).json({ message: 'Error deleting blood pressure' });
  }
};

export {
  getBloodPressures,
  getBloodPressureById,
  postBloodPressure,
  putBloodPressure,
  deleteBloodPressureEntry,
};