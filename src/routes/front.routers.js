var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.send(`Sistema`);
});

router.get("/register", (req, res) => {
  res.send(`Sistema register`);
});

module.exports = router;
