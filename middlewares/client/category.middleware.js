const ProductCategory = require("../../models/product-category.model");
const PostCategory = require("../../models/post-category.model");

const createTreeHelper = require("../../helpers/createTree");

module.exports.category = async (req, res, next) => {
    const productsCategory = await ProductCategory.find({
        deleted: false
    });

    const postsCategory = await PostCategory.find({
        deleted: false
    }); 

    const newProductsCategory = createTreeHelper.tree(productsCategory);

    const newPostsCategory = createTreeHelper.tree(postsCategory);

    res.locals.layoutProductsCategory = newProductsCategory;

    res.locals.layoutPostsCategory = newPostsCategory;

    next();
}