// call data 
const Post = require("../../models/post.model");
const PostCategory = require("../../models/post-category.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

const createTreeHelper = require("../../helpers/createTree");

// [GET] / admin / posts
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
    const countPosts = await Post.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countPosts
    );
    //End Pagination

    //Truy vấn Database
    const posts = await Post.find(find)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    for (const post of posts) {
        // Lấy ra thông tin người tạo
        const user = await Account.findOne({
            _id: post.createdBy.account_id
        });

        if (user) {
            post.accountFullName = user.fullName;
        }

        //Lấy ra người cạp nhật gần nhất
        // const updatedBy = product.updatedBy[product.updatedBy.length - 1];
        const updatedBy = post.updatedBy.slice(-1)[0];
        if (updatedBy) {
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            });

            updatedBy.accountFullName = userUpdated.fullName
        }
    }

    res.render("admin/pages/posts/index", {
        pageTitle: "Quản lý bài viết",
        currentPage: "posts",
        posts: posts,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });

    // res.send("OK");
};

// [PATCH] / admin / posts / change-status/ :status/ :id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    await Post.updateOne({ _id: id }, {
        status: status,
        $push: { updatedBy: updatedBy }
    });

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
}

// [DELETE] / admin / posts / delete / :id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    // Xóa vĩnh viễn
    // await Product.deleteOne({ _id: id });
    // Xóa mềm 
    await Post.updateOne({ _id: id }, {
        deleted: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        }
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    res.redirect("back");
}

// [GET] / admin / posts / create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const category = await PostCategory.find(find);

    const newCategory = createTreeHelper.tree(category);


    res.render("admin/pages/posts/create", {
        pageTitle: "Thêm mới bài viết",
        currentPage: "posts",
        category: newCategory
    });
}

// [POST] / admin / posts / create
module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if (req.body.position == "") {
        const countPosts = await Post.countDocuments();
        req.body.position = countPosts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
        account_id: res.locals.user.id
    };

    const post = new Post(req.body);
    await post.save();

    res.redirect(`${systemConfig.prefixAdmin}/posts`);
}

// [GET] / admin / posts / edit / :id
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const post = await Post.findOne(find);

        const category = await PostCategory.find({
            deleted: false
        });

        const newCategory = createTreeHelper.tree(category);

        res.render("admin/pages/posts/edit", {
            pageTitle: "Chỉnh sửa bài viết",
            currentPage: "posts",
            post: post,
            category: newCategory
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/posts`);
    }
}

// [PATCH] / admin / posts / edit / :id
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
        await Post.updateOne({ _id: id }, {
            ...req.body,
            $push: { updatedBy: updatedBy }
        });
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
    }

    res.redirect("back");
}

// [GET] / admin / posts / detail / :id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const post = await Post.findOne(find);

        res.render("admin/pages/posts/detail", {
            pageTitle: post.title,
            currentPage: "posts",
            post: post
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/posts`);
    }
}
