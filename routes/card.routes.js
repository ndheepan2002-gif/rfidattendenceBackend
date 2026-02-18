const express = require("express");
const router = express.Router();
const cardController = require("../controllers/card.controller");

router.post("/read-card", cardController.readCard);
// router.get("/get-card", cardController.getLastCard);

module.exports = router;
