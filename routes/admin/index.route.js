const systemConfig = require("../../config/system");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const postRoutes = require("./post.route");
const productCategoryRoutes = require("./product-category.route");
const postCategoryRoutes = require("./post-category.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");
const myAccountRoutes = require("./my-account.route");
const infoOrderRoutes = require("./info-order.route");
const settingRoutes = require("./setting.route");


module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(
        PATH_ADMIN + "/dashboard",
        authMiddleware.requireAuth,
        dashboardRoutes);

    app.use(
        PATH_ADMIN + "/products",
        authMiddleware.requireAuth,
        productRoutes
    );

    app.use(
        PATH_ADMIN + "/posts",
        authMiddleware.requireAuth,
        postRoutes
    );

    app.use(PATH_ADMIN + "/products-category", authMiddleware.requireAuth, productCategoryRoutes);

    app.use(PATH_ADMIN + "/posts-category", authMiddleware.requireAuth, postCategoryRoutes);

    app.use(PATH_ADMIN + "/roles", authMiddleware.requireAuth, roleRoutes);

    app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountRoutes);

    app.use(PATH_ADMIN + "/auth", authRoutes);

    app.use(PATH_ADMIN + "/my-account", authMiddleware.requireAuth, myAccountRoutes);

    app.use(PATH_ADMIN + "/info-order", authMiddleware.requireAuth, infoOrderRoutes);

    app.use(PATH_ADMIN + "/settings", authMiddleware.requireAuth, settingRoutes);

}