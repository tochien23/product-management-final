// call data 
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const productHelper = require("../../helpers/products");

const createTreeHelper = require("../../helpers/createTree");

// [GET] / admin / info-order
module.exports.index = async (req, res) => {

    let find = {
        deleted: false
    };

    //Tìm kiếm theo mã đơn hàng hoặc tên khách hàng
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
        find.$or = [
            { "userInfo.fullName": objectSearch.regex },
            { "userInfo.phone": objectSearch.regex },
            { "userInfo.address": objectSearch.regex }
        ];
    }

    //Pagination
    const countOrders = await Order.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 6
        },
        req.query,
        countOrders
    );
    //End Pagination

    //Sort - Mặc định sắp xếp theo ngày tạo giảm dần
    let sort = {
        createdAt: "desc"
    };
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    }
    //End Sort

    //Truy vấn Database
    const orders = await Order.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    // Tính toán thông tin sản phẩm và tổng tiền cho mỗi đơn hàng
    for (const order of orders) {
        let totalPrice = 0;
        let totalQuantity = 0;

        for (const item of order.products) {
            const product = await Product.findOne({
                _id: item.product_id
            }).select("title thumbnail slug");

            if (product) {
                item.productInfo = product;
                item.priceNew = productHelper.priceNewProduct(item);
                item.totalPrice = item.priceNew * item.quantity;
                totalPrice += item.totalPrice;
                totalQuantity += item.quantity;
            }
        }

        order.totalPrice = totalPrice;
        order.totalQuantity = totalQuantity;
    }

    res.render("admin/pages/info-orders/index", {
        pageTitle: "Danh sách đơn hàng của khách hàng",
        currentPage: "orders",
        orders: orders,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [DELETE] / admin / orders / delete / :id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    
    try {
        // Xóa mềm đơn hàng
        await Order.updateOne({ _id: id }, {
            deleted: true,
            deletedAt: new Date()
        });
        
        req.flash("success", "Đã xóa đơn hàng thành công!");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra khi xóa đơn hàng!");
    }
    
    res.redirect("back");
}

// [PATCH] / admin / orders / change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    try {
        switch (type) {
            case "delete-all":
                await Order.updateMany(
                    { _id: { $in: ids } },
                    {
                        deleted: true,
                        deletedAt: new Date()
                    }
                );
                req.flash("success", `Đã xóa thành công ${ids.length} đơn hàng!`);
                break;
            default:
                req.flash("error", "Hành động không hợp lệ!");
                break;
        }
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
    }

    res.redirect("back");
}

// [GET] / admin / orders / search
module.exports.search = async (req, res) => {
    const keyword = req.query.keyword;
    
    if (!keyword) {
        return res.redirect(`${systemConfig.prefixAdmin}/info-order`);
    }
    
    let find = {
        deleted: false,
        $or: [
            { "userInfo.fullName": new RegExp(keyword, "i") },
            { "userInfo.phone": new RegExp(keyword, "i") },
            { "userInfo.address": new RegExp(keyword, "i") }
        ]
    };

    const orders = await Order.find(find)
        .sort({ createdAt: "desc" })
        .limit(20);

    // Tính toán thông tin sản phẩm cho mỗi đơn hàng
    for (const order of orders) {
        let totalPrice = 0;
        let totalQuantity = 0;

        for (const item of order.products) {
            const product = await Product.findOne({
                _id: item.product_id
            }).select("title thumbnail slug");

            if (product) {
                item.productInfo = product;
                item.priceNew = productHelper.priceNewProduct(item);
                item.totalPrice = item.priceNew * item.quantity;
                totalPrice += item.totalPrice;
                totalQuantity += item.quantity;
            }
        }

        order.totalPrice = totalPrice;
        order.totalQuantity = totalQuantity;
    }

    res.render("admin/pages/info-orders/index", {
        pageTitle: `Kết quả tìm kiếm: "${keyword}"`,
        currentPage: "orders",
        orders: orders,
        keyword: keyword
    });
}

// [GET] / admin / orders / detail / :id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const order = await Order.findOne(find);

        if (!order) {
            req.flash("error", "Không tìm thấy đơn hàng!");
            return res.redirect(`${systemConfig.prefixAdmin}/info-order`);
        }

        // Lấy thông tin chi tiết sản phẩm
        for (const item of order.products) {
            const product = await Product.findOne({
                _id: item.product_id
            }).select("title thumbnail slug description");

            if (product) {
                item.productInfo = product;
                item.priceNew = productHelper.priceNewProduct(item);
                item.totalPrice = item.priceNew * item.quantity;
            }
        }

        // Tính tổng tiền đơn hàng
        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

        res.render("admin/pages/info-orders/detail", {
            pageTitle: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
            currentPage: "orders",
            order: order
        });
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${systemConfig.prefixAdmin}/info-order`);
    }
}
