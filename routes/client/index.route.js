const categoryMiddleware = require("../../middlewares/client/category.middleware");

const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const postRoutes = require("./blog.route");

module.exports = (app) => {
    app.use(categoryMiddleware.category);

    app.use("/", homeRoutes);

    app.use("/products", productRoutes);

    app.use("/posts", postRoutes);
}


