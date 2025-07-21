const Product = require("../../models/product.model");

const productsHelper = require("../../helpers/products");

// [GET] / search
module.exports.index = async (req, res) => {
    const keyword = req.query.keyword;

    let newProducts = [];

    if (keyword && keyword.trim() !== "") {
        const regax = new RegExp(keyword.trim(), "i");
        const products = await Product.find({
            title: regax,
            deleted: false,
            status: "active"
        });

        newProducts = productsHelper.priceNewProducts(products);
    }

    res.render("client/pages/search/index", {
        pageTitle: "Kết quả tìm kiếm",
        keyword: keyword || "",
        products: newProducts
    });
}