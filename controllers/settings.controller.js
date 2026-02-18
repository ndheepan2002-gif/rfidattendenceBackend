const Settings = require("../models/Settings");

// SAVE / UPDATE SETTINGS
exports.saveSettings = async (req, res) => {
  try {
    const {
      loginTime,
      logoutTime,
      autoLocation,
      latitude,
      longitude,
    } = req.body;

    let settings = await Settings.findOne();

    if (settings) {
      settings.loginTime = loginTime;
      settings.logoutTime = logoutTime;
      settings.autoLocation = autoLocation;
      settings.latitude = latitude;
      settings.longitude = longitude;
      settings.updatedAt = new Date();
      await settings.save();
    } else {
      settings = await Settings.create({
        loginTime,
        logoutTime,
        autoLocation,
        latitude,
        longitude,
      });
    }

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SETTINGS
exports.getSettings = async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings);
};
