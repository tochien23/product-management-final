const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");
const settingMiddleware = require("../../middlewares/client/setting.middleware");

const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const postRoutes = require("./blog.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const orderRoutes = require("./order.route");
const userRoutes = require("./user.route");

module.exports = (app) => {
    app.use(categoryMiddleware.category);
    app.use(cartMiddleware.cartId);
    app.use(userMiddleware.infoUser);
    app.use(settingMiddleware.settingGeneral);

    app.use("/", homeRoutes);

    app.use("/products", productRoutes);

    app.use("/posts", postRoutes);

    app.use("/search", searchRoutes);

    app.use("/cart", cartRoutes);

    app.use("/checkout", checkoutRoutes);

    app.use("/orders", orderRoutes);

    app.use("/user", userRoutes);

}


