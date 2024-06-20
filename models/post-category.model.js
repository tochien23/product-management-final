const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const postCategorySchema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        default: "",
    },
    description: String,
    status: String,
    position: Number,
    slug: {
        type: String,
        slug: 'title',
        unique: true
    },
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    // deletedAt: Date
    deletedBy: {
        account_id: String,
        deletedAt: Date
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ],
}, {
    timestamps: true
});

const PostCategory = mongoose.model('PostCategory', postCategorySchema, "posts-category");

module.exports = PostCategory;