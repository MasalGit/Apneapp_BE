const sleepHoursData = [
  { id: 1,  date: '2026-03-24', hours: 7.0 },
  { id: 2,  date: '2026-03-25', hours: 6.5 },
  { id: 3,  date: '2026-03-26', hours: 8.0 },
  { id: 4,  date: '2026-03-27', hours: 7.5 },
  { id: 5,  date: '2026-03-28', hours: 6.0 },
  { id: 6,  date: '2026-03-29', hours: 9.0 },
  { id: 7,  date: '2026-03-30', hours: 7.0 },
  { id: 8,  date: '2026-03-31', hours: 6.5 },
  { id: 9,  date: '2026-04-01', hours: 8.5 },
  { id: 10, date: '2026-04-02', hours: 7.0 },
  { id: 11, date: '2026-04-03', hours: 6.0 },
  { id: 12, date: '2026-04-04', hours: 7.5 },
  { id: 13, date: '2026-04-05', hours: 8.0 },
  { id: 14, date: '2026-04-06', hours: 9.0 },
  { id: 15, date: '2026-04-07', hours: 6.5 },
  { id: 16, date: '2026-04-08', hours: 7.0 },
  { id: 17, date: '2026-04-09', hours: 8.5 },
  { id: 18, date: '2026-04-10', hours: 7.5 },
  { id: 19, date: '2026-04-11', hours: 6.0 },
  { id: 20, date: '2026-04-12', hours: 8.0 },
  { id: 21, date: '2026-04-13', hours: 7.0 },
  { id: 22, date: '2026-04-14', hours: 6.5 },
  { id: 23, date: '2026-04-15', hours: 9.0 },
  { id: 24, date: '2026-04-16', hours: 7.5 },
  { id: 25, date: '2026-04-17', hours: 8.0 },
  { id: 26, date: '2026-04-18', hours: 6.0 },
  { id: 27, date: '2026-04-19', hours: 7.0 },
  { id: 28, date: '2026-04-20', hours: 8.5 },
  { id: 29, date: '2026-04-21', hours: 7.5 },
  { id: 30, date: '2026-04-22', hours: 6.5 },
];

const sleepQualityData = [
  { id: 1,  date: '2026-03-24', quality: 1.8 },
  { id: 2,  date: '2026-03-25', quality: 1.3 },
  { id: 3,  date: '2026-03-26', quality: 2.0 },
  { id: 4,  date: '2026-03-27', quality: 1.6 },
  { id: 5,  date: '2026-03-28', quality: 1.1 },
  { id: 6,  date: '2026-03-29', quality: 1.9 },
  { id: 7,  date: '2026-03-30', quality: 1.5 },
  { id: 8,  date: '2026-03-31', quality: 1.2 },
  { id: 9,  date: '2026-04-01', quality: 1.7 },
  { id: 10, date: '2026-04-02', quality: 2.0 },
  { id: 11, date: '2026-04-03', quality: 1.0 },
  { id: 12, date: '2026-04-04', quality: 1.4 },
  { id: 13, date: '2026-04-05', quality: 1.8 },
  { id: 14, date: '2026-04-06', quality: 1.9 },
  { id: 15, date: '2026-04-07', quality: 1.3 },
  { id: 16, date: '2026-04-08', quality: 1.6 },
  { id: 17, date: '2026-04-09', quality: 2.0 },
  { id: 18, date: '2026-04-10', quality: 1.5 },
  { id: 19, date: '2026-04-11', quality: 1.1 },
  { id: 20, date: '2026-04-12', quality: 1.7 },
  { id: 21, date: '2026-04-13', quality: 1.4 },
  { id: 22, date: '2026-04-14', quality: 1.2 },
  { id: 23, date: '2026-04-15', quality: 1.9 },
  { id: 24, date: '2026-04-16', quality: 1.6 },
  { id: 25, date: '2026-04-17', quality: 2.0 },
  { id: 26, date: '2026-04-18', quality: 1.0 },
  { id: 27, date: '2026-04-19', quality: 1.5 },
  { id: 28, date: '2026-04-20', quality: 1.8 },
  { id: 29, date: '2026-04-21', quality: 1.3 },
  { id: 30, date: '2026-04-22', quality: 1.7 },
];

const getSleepHours = (req, res) => {
  res.json(sleepHoursData);
};

const getSleepQuality = (req, res) => {
  res.json(sleepQualityData);
};

export { getSleepHours, getSleepQuality };
