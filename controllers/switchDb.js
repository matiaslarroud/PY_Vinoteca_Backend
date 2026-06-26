const { switchDatabase, getCurrentDb } = require('../db/db');

const getDbStatus = (req, res) => {
  res.status(200).json({ ok: true, ...getCurrentDb() });
};

const postSwitchDb = async (req, res) => {
  const { target } = req.body;
  if (target !== 'dev' && target !== 'prod') {
    return res.status(400).json({ ok: false, message: 'target debe ser "dev" o "prod"' });
  }
  try {
    await switchDatabase(target);
    res.status(200).json({ ok: true, ...getCurrentDb() });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { getDbStatus, postSwitchDb };
