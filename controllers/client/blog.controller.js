const PostCategory = require("../../models/post-category.model");
const Post = require("../../models/post.model");

const postsCategoryHelper = require("../../helpers/posts-category");
// [GET] /products
module.exports.index = async (req, res) => {
    const posts = await Post.find({
        status: "active",
        deleted: false
    }).sort({ position: "desc" });

    res.render("client/pages/posts/index", {
        pageTitle: "Danh sách bài viết",
        posts: posts
    });
}

// [GET] / blogs / :slug
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slugBlog,
            status: "active"
        };

        const post = await Post.findOne(find);

        if (post.post_category_id) {
            const category = await PostCategory.findOne({
                _id: post.post_category_id,
                status: "active",
                deleted: false
            });

            post.category = category;
        }

        res.render("client/pages/posts/detail", {
            pageTitle: post.title,
            post: post
        });
    } catch (error) {
        res.redirect(`/posts`);
    }
}

// [GET] /posts / :slugCategory
module.exports.category = async (req, res) => {
    const category = await PostCategory.findOne({
        slug: req.params.slugCategory,
        status: "active",
        deleted: false
    });

    const listSubCategory = await postsCategoryHelper.getSubCategory(category.id);

    const listSubCategoryId = listSubCategory.map(item => item.id);

    const posts = await Post.find({
        post_category_id: { $in: [category.id, ...listSubCategoryId] },
        deleted: false
    }).sort({ position: "desc" });

    res.render("client/pages/posts/index", {
        pageTitle: category.title,
        posts: posts
    });
}