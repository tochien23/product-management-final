const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

// [GET]/
module.exports.index = async (req, res) => {
    //Lấy ra sản phẩm nổi bật
    const productsFeatured = await Product.find({
        featured: 1,
        deleted: false,
        status: "active"
    }).limit(6);

    const newProducts = productsHelper.priceNewProducts(productsFeatured);
    // end

    // Lấy ra sản phẩm mới nhất
    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({ position: "desc" }).limit(6);

    const newProductsNew = productsHelper.priceNewProducts(productsNew);
    // End

    res.render("client/pages/home/index.pug", {
        pageTitle: "Trang chủ",
        productsFeatured: newProducts,
        productsNew: newProductsNew
    });
}