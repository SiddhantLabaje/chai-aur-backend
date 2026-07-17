const asyncHandler=(fn)=>(req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch((error)=>{
        res.status(error.statusCode||500).json({
            success: false,
            message: error.message
        })
    })
}


// export default asyncHandler;

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }


export { asyncHandler }