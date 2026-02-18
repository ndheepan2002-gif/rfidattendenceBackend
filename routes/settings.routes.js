const router = require("express").Router();
const {
  saveSettings,
  getSettings,
} = require("../controllers/settings.controller");

router.post("/", saveSettings);
router.get("/", getSettings);

module.exports = router;
