const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/order.controller");

router.get("/", controller.index);

router.get("/detail/:orderId", controller.detail);

router.get("/search", controller.search);

module.exports = router; 