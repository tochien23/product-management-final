module.exports = (objectPagination, query, countProducts) => {
    if (query.page) {
        objectPagination.currentPage = parseInt(query.page);
    }
    //Tính toán số trang
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    //Tính số lượng trang
    const totalPage = Math.ceil(countProducts / objectPagination.limitItems);
    objectPagination.totalPage = totalPage;

    return objectPagination;
}