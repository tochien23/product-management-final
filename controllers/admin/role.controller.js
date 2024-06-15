const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");

// [GET] / admin / role
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await Role.find(find);

    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        records: records
    });
};

// [GET] / admin / roles / create
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Tạo nhóm quyền",
    });
}

// [DELETE] / admin / roles / delete / :id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    // Xóa vĩnh viễn
    // await Product.deleteOne({ _id: id });
    // Xóa mềm 
    await Role.updateOne({ _id: id }, {
        deleted: true,
        deletedAt: new Date()
    });
    req.flash("success", `Đã xóa thành công quyền!`);
    res.redirect("back");
}

// [POST] / admin / roles / create
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Tạo nhóm quyền",
    });
}

// [POST] / admin / roles / createPost
module.exports.createPost = async (req, res) => {
    const record = new Role(req.body);

    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/roles`);
}

// [POST] / admin / roles / edit / :id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        let find = {
            _id: id,
            deleted: false
        };

        const data = await Role.findOne(find);


        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            data: data
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }

}

// [PATCH] / admin / roles / edit / : id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        await Role.updateOne({ _id: id }, req.body);

        req.flash("success", "Cập nhật nhóm quyền thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật nhóm quyền thất bại!");
    }
    res.redirect("back");
};

// [GET] / admin / roles / detail / :id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const role = await Role.findOne(find);

        res.render("admin/pages/roles/detail", {
            pageTitle: role.title,
            role: role
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
}

// [GET] / admin / roles / permissions
module.exports.permissions = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await Role.find(find);

    res.render("admin/pages/roles/permissions", {
        pageTitle: "Phân quyền",
        records: records
    });
}

// [PATCH] / admin / roles / permissions
module.exports.permissionsPatch = async (req, res) => {
    try {
    const permissions = JSON.parse(req.body.permissions);
        for (const item of permissions) {
            await Role.updateOne(
                { _id: item.id },
                { permissions: item.permissions }
            );
        }
        req.flash("success", "Cập nhật phân quyền thành công!");     
    } catch (error) {
        req.flash("error", "Cập nhật phân quyền thất bại!");
    }

    res.redirect("back");
};