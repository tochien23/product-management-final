const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

const productHelper = require("../../helpers/products");
const paginationHelper = require("../../helpers/pagination");

// [GET] /orders - Lấy danh sách đơn hàng của người dùng
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId;
    
    let find = {
        deleted: false,
        cart_id: cartId
    };

    // Pagination
    const countOrders = await Order.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 6
        },
        req.query,
        countOrders
    );

    // Sort by newest first
    let sort = {
        createdAt: "desc"
    };

    // Truy vấn database
    const orders = await Order.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    // Tính toán thông tin sản phẩm và tổng tiền cho mỗi đơn hàng
    for (const order of orders) {
        let totalPrice = 0;

        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            }).select("title thumbnail slug");

            if (productInfo) {
                product.productInfo = productInfo;
                product.priceNew = productHelper.priceNewProduct(product);
                product.totalPrice = product.priceNew * product.quantity;
                totalPrice += product.totalPrice;
            }
        }

        order.totalPrice = totalPrice;
    }

    res.render("client/pages/orders/index", {
        pageTitle: "Lịch sử đơn hàng",
        orders: orders,
        pagination: objectPagination
    });
};

// [GET] /orders/detail/:orderId - Lấy chi tiết đơn hàng
module.exports.detail = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const cartId = req.cookies.cartId;

        const order = await Order.findOne({
            _id: orderId,
            cart_id: cartId,
            deleted: false
        });

        if (!order) {
            req.flash("error", "Không tìm thấy đơn hàng!");
            return res.redirect("/orders");
        }

        // Lấy thông tin chi tiết sản phẩm
        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            }).select("title thumbnail slug description");

            if (productInfo) {
                product.productInfo = productInfo;
                product.priceNew = productHelper.priceNewProduct(product);
                product.totalPrice = product.priceNew * product.quantity;
            }
        }

        // Tính tổng tiền đơn hàng
        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

        res.render("client/pages/orders/detail", {
            pageTitle: `Đơn hàng #${order.id}`,
            order: order
        });

    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/orders");
    }
};

// [GET] /orders/search - Tìm kiếm đơn hàng theo nhiều tiêu chí
module.exports.search = async (req, res) => {
    const cartId = req.cookies.cartId;
    const { keyword, dateFrom, dateTo, searchType } = req.query;

    // Validate input
    if (!keyword && !dateFrom && !dateTo) {
        req.flash("error", "Vui lòng nhập từ khóa tìm kiếm hoặc chọn khoảng thời gian!");
        return res.redirect("/orders");
    }

    try {
        let find = {
            deleted: false,
            cart_id: cartId
        };

        // Search by keyword
        if (keyword) {
            if (searchType === "orderId") {
                // Tìm kiếm theo mã đơn hàng
                try {
                    // Nếu keyword là ObjectId hợp lệ
                    if (keyword.match(/^[0-9a-fA-F]{24}$/)) {
                        find._id = keyword;
                    } else {
                        // Tìm kiếm theo 6 ký tự cuối của ObjectId
                        const orders = await Order.find({
                            deleted: false,
                            cart_id: cartId
                        });
                        
                        const matchedOrders = orders.filter(order => 
                            order._id.toString().slice(-6).toUpperCase().includes(keyword.toUpperCase())
                        );
                        
                        if (matchedOrders.length > 0) {
                            find._id = { $in: matchedOrders.map(order => order._id) };
                        } else {
                            find._id = null; // Không tìm thấy
                        }
                    }
                } catch (error) {
                    find._id = null; // Invalid ObjectId
                }
            } else {
                // Tìm kiếm theo thông tin khách hàng
                const regex = new RegExp(keyword, "i");
                find.$or = [
                    { "userInfo.fullName": regex },
                    { "userInfo.phone": regex },
                    { "userInfo.address": regex }
                ];
            }
        }

        // Search by date range
        if (dateFrom || dateTo) {
            find.createdAt = {};
            if (dateFrom) {
                find.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999); // End of day
                find.createdAt.$lte = endDate;
            }
        }

        // Get orders with pagination
        const countOrders = await Order.countDocuments(find);
        let objectPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 6
            },
            req.query,
            countOrders
        );

        const orders = await Order.find(find)
            .sort({ createdAt: "desc" })
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);

        // Tính toán thông tin sản phẩm và tổng tiền cho mỗi đơn hàng
        for (const order of orders) {
            let totalPrice = 0;

            for (const product of order.products) {
                const productInfo = await Product.findOne({
                    _id: product.product_id
                }).select("title thumbnail slug");

                if (productInfo) {
                    product.productInfo = productInfo;
                    product.priceNew = productHelper.priceNewProduct(product);
                    product.totalPrice = product.priceNew * product.quantity;
                    totalPrice += product.totalPrice;
                }
            }

            order.totalPrice = totalPrice;
        }

        // Prepare search info for template
        const searchInfo = {
            keyword: keyword || "",
            dateFrom: dateFrom || "",
            dateTo: dateTo || "",
            searchType: searchType || "customer",
            totalResults: countOrders
        };

        res.render("client/pages/orders/search", {
            pageTitle: "Kết quả tìm kiếm đơn hàng",
            orders: orders,
            pagination: objectPagination,
            searchInfo: searchInfo
        });

    } catch (error) {
        console.error("Search error:", error);
        req.flash("error", "Có lỗi xảy ra khi tìm kiếm!");
        res.redirect("/orders");
    }
}; 