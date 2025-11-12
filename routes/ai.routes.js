const express = require("express");
const router = express.Router();
const { getAiRecommendations, handleCarQuery } = require("../controllers/ai.controller.js");

router.post("/recommendations", getAiRecommendations);
router.post("/query", handleCarQuery);

module.exports = router;
