export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        result_code: "404",
        result_msg: "Not Found",
        data: null,
    });
};
