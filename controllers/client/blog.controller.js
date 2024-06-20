const Post = require("../../models/post.model")

// [GET] /products
module.exports.index = async (req, res) => {
    const posts = await Post.find({
        status: "active",
        deleted: false
    }).sort({ position: "desc" });

    // const newPosts = posts.map(item => {
    //     item.priceNew = (item.price * (100 - item.discountPercentage) / 100).toFixed(0);
    //     return item;
    // });
    res.render("client/pages/posts/index", {
        pageTitle: "Danh sách bài viết",
        posts: posts
    });
}

// [GET] /products / :slug
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slug,
            status: "active"
        };

        const post = await Post.findOne(find);

        console.log(post);
        res.render("client/pages/posts/detail", {
            pageTitle: post.title,
            post: post
        });
    } catch (error) {
        res.redirect(`/posts`);
    }
}