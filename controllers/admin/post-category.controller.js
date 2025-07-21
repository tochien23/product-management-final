const PostCategory = require("../../models/post-category.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system")

const createTreeHelper = require("../../helpers/createTree")

// [GET] / admin / products-category
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    };

    //Truy vấn Database
    const records = await PostCategory.find(find);

    for (const record of records) {
        // Lấy ra thông tin người tạo
        const user = await Account.findOne({
            _id: record.createdBy.account_id
        });

        if (user) {
            product.accountFullName = user.fullName;
        }

        //Lấy ra người cập nhật gần nhất
        // const updatedBy = product.updatedBy[product.updatedBy.length - 1];
        const updatedBy = record.updatedBy.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            });

            updatedBy.accountFullName = userUpdated.fullName
        }
    }

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/posts-category/index", {
        pageTitle: "Danh mục bài viết",
        currentPage: "posts-category",
        records: newRecords
    });
};

// [PATCH] / admin / products / change-status/ :status/ :id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await PostCategory.updateOne({ _id: id }, { status: status });

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
}

// [PATCH] / admin / products / change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await PostCategory.updateMany({ _id: { $in: ids } }, { status: "active" });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await PostCategory.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "delete-all":
            await PostCategory.updateMany(
                { _id: { $in: ids } },
                {
                    deleted: true,
                    deletedAt: new Date()
                }
            );
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await PostCategory.updateOne({ _id: id }, {
                    position: position
                });
                req.flash("success", `Đã đổi vị trí thành công ${ids.length} sản phẩm!`);
            }
            break;
        default:
            break;
    }

    res.redirect("back");
}

// [DELETE] / admin / products-category / delete /:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    // Xóa vĩnh viễn
    // await Product.deleteOne({ _id: id });
    // Xóa mềm 
    await PostCategory.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        },
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    res.redirect("back");
}

// [GET] / admin / products-category / create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await PostCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/posts-category/create", {
        pageTitle: "Tạo danh mục bài viết",
        currentPage: "posts-category",
        records: newRecords
    });
}

// [POST] / admin / products-category / create
module.exports.createPost = async (req, res) => {
    if (req.body.position == "") {
        const count = await PostCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    //
    const record = new PostCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
}

// [GET] / admin / products-category / edit /:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await PostCategory.findOne({
            _id: id,
            deleted: false
        });

        const records = await PostCategory.find({
            deleted: false
        })

        const newRecords = createTreeHelper.tree(records);

        res.render("admin/pages/posts-category/edit", {
            pageTitle: "Chỉnh sửa danh mục bài viết",
            currentPage: "posts-category",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
    }
};

// [PATCH] / admin / products-category / edit /:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        }

        req.body.position = parseInt(req.body.position);

        await PostCategory.updateOne({ _id: id, }, {
            ...req.body,
            $push: { updatedBy: updatedBy }
        });
        req.flash("success", "Cập nhật thành công danh mục sản phẩm");
    } catch (error) {
        req.flash("success", "Cập nhật thất bại");
    }

    res.redirect("back");
};

// [GET] / admin / products-category / detail /:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await PostCategory.findOne(find);

        res.render("admin/pages/posts-category/detail", {
            pageTitle: product.title,
            currentPage: "posts-category",
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
    }
};