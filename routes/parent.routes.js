const express = require("express");
const router = express.Router();
const getMyChildren = require("../controllers/parent.controller");

router.get(
    "/my-children",
    getMyChildren
);

module.exports = router;
