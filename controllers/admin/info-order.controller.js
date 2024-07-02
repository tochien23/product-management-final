// call data 
const InfoOrder = require("../../models/info-order.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

const createTreeHelper = require("../../helpers/createTree");

// [GET] / admin / info-order
module.exports.index = async (req, res) => {

    //Bộ lọc
    const filterStatus = filterStatusHelper(req.query);

    let find = {
        deleted: false
    };

    if (req.query.status) {
        find.status = req.query.status;
    }

    //Tìm kiếm
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    //Pagination
    const countProducts = await InfoOrder.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProducts
    );
    //End Pagination

    //Sort
    let sort = {

    };
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        //Fix cứng mặc định sắp xếp thep giảm dần
        sort.position = "desc";
    }
    //End Sort

    //Truy vấn Database
    const products = await InfoOrder.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    for (const product of products) {
        // Lấy ra thông tin người tạo
        const user = await Account.findOne({
            _id: product.createdBy.account_id
        });

        if (user) {
            product.accountFullName = user.fullName;
        }

        //Lấy ra người cạp nhật gần nhất
        // const updatedBy = product.updatedBy[product.updatedBy.length - 1];
        // const updatedBy = product.updatedBy.slice(-1)[0];
        // if (updatedBy) {
        //     const userUpdated = await Account.findOne({
        //         _id: updatedBy.account_id
        //     });

        //     updatedBy.accountFullName = userUpdated.fullName
        // }
    }

    res.render("admin/pages/info-orders/index", {
        pageTitle: "Danh sách đơn hàng",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [PATCH] / admin / products / change-status/ :status/ :id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    await Product.updateOne({ _id: id }, {
        status: status,
        $push: { updatedBy: updatedBy }
    });

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
}

// [PATCH] / admin / products / change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, {
                status: "active",
                $push: { updatedBy: updatedBy }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, {
                status: "inactive",
                $push: { updatedBy: updatedBy }
            });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "delete-all":
            await Product.updateMany(
                { _id: { $in: ids } },
                {
                    deleted: true,
                    deletedBy: {
                        account_id: res.locals.user.id,
                        deletedAt: new Date()
                    }
                }
            );
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await Product.updateOne({ _id: id }, {
                    position: position,
                    $push: { updatedBy: updatedBy }
                });
                req.flash("success", `Đã đổi vị trí thành công ${ids.length} sản phẩm!`);
            }
            break;
        default:
            break;
    }

    res.redirect("back");
}

// [DELETE] / admin / products / delete / :id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    // Xóa vĩnh viễn
    // await Product.deleteOne({ _id: id });
    // Xóa mềm 
    await Product.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        }
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    res.redirect("back");
}

// [GET] / admin / orders / create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const category = await InfoOrder.find(find);

    // const newCategory = createTreeHelper.tree(category);


    res.render("admin/pages/info-orders/create", {
        pageTitle: "Thêm mới đơn hàng",
        category: category
    });
}

// [POST] / admin / products / create
module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if (req.body.position == "") {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
        account_id: res.locals.user.id
    };

    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

// [GET] / admin / products / edit / :id
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        const category = await ProductCategory.find({
            deleted: false
        });

        const newCategory = createTreeHelper.tree(category);

        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product,
            category: newCategory
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

// [PATCH] / admin / products / edit / :id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    try {

        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        }
        await Product.updateOne({ _id: id }, {
            ...req.body,
            $push: { updatedBy: updatedBy }
        });
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
    }

    res.redirect("back");
}

// [GET] / admin / products / detail / :id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}
