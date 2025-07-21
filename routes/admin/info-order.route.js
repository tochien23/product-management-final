const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/info-order.controller");

router.get("/", controller.index);

router.get("/search", controller.search);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/detail/:id", controller.detail);

module.exports = router;