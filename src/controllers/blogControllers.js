const { default: mongoose } = require("mongoose");
const authorModel = require("../models/authorModel");
const blogsModel = require("../models/blogsModel");
const { find } = require("../models/authorModel");




const createBlog = async function (req, res) {
    try {
        let data = req.body;
        let data1 = req.body.authorId;
        if (!data1) {
            res.status(400).send({ status: false, msg: "AuthorId is Required" })
        }
        let findBlog = await authorModel.findById(data1);
        if (!findBlog) {
            return res.status(404).send({ status: false, msg: 'No such Author is Present with this AuthorId' });
        } else {
            let savedata1 = await blogsModel.create(data);
            return res.status(201).send({ status: true, msg: "Blog is created successfully", data: savedata1 });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}




const getBlogs = async function (req, res) {
    try {
        data = req.query;
        data1 = {
            isDeleted: false,
            isPublished: true
        }
        if (!data) {
            res.status(401).send({ status: false, msg: "No parameter is passed" })
        }
        let data2 = Object.assign(data, data1)
        console.log(data2)
        let getByQuery = await blogsModel.find(data2)

        if (getByQuery.length <= 0) {
            return res.status(404).send({ status: false, msg: 'Data Not Found' });
        } else {
            res.status(200).send({ status: true, msg: "Blog list", data: getByQuery })
        }
    }


    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}




const updateBlogs = async function (req, res) {
    try {
        let data1 = req.params.blogId;
        if (Object.keys(data1).length == 0) {
            res.status(401).send({ status: false, msg: 'BlogId is Required' });
        }
        let findBlog = await blogsModel.findOne({ _id: data1 })
        console.log(data1)
        if (!findBlog) {
            res.status(404).send({ status: false, msg: 'Blog Not Found' });
        }
        else {
            let data2 = req.authorId;
            if (!data2) {
                res.status(404).send({ status: false, msg: 'Not a valid token' });
            }

            if (findBlog.authorId.toString() !== data2) {
                res.status(404).send({ status: false, msg: 'unauthorized access! credential does not matched' })
            }

            let data = req.body;
            let updateblogs = await blogsModel.findOneAndUpdate({ _id: data1, isDeleted: false }, { $set: data }, { new: true })
            console.log(updateblogs)
            updateblogs.isPublished = true
            updateblogs.publishedAt = Date();
            updateblogs.save()
            return res.status(200).send({ status: true, data: updateblogs });
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}




const deleteBlogs = async function (req, res) {
    try {
        let data1 = req.params.blogId;
        if (Object.keys(data1).length == 0) {
            res.status(400).send({ status: false, msg: "BlogsId Required" });
        }

        let findBlog = await blogsModel.findOne({ _id : data1, isDeleted: false })

        if (findBlog) {
            let data2 = req.authorId;
            if(!data2){
                res.status(404).send({ status: false, msg: 'Not a valid token' });
            }

            if (findBlog.authorId.toString() !== data2) {
                res.status(404).send({ status: false, msg: 'unauthorized access! credential does not matched' })
            }

            let deleteData = await blogsModel.findOneAndUpdate({ _id : data1, isDeleted: false }, { isDeleted: true, deletedAt: Date() }, { new: true })
            console.log(deleteData)
            return res.status(201).send({ status: true, msg: "successfully deleted",data:deleteData });

        } else {
            return res.status(404).send({ status: false, msg: "Blog is already deleted" });

        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}





const deleteByQuery = async function (req, res) {
    try {
        const data = req.query;
        let data2 = req.authorId;
        console.log(data2)

        if (!data) {
            return res.status(400).send({ status: false, msg: "Enter Valid Valid Input" })
        }

        let checkblog = await blogsModel.find({data})
        console.log(checkblog)
        if (!checkblog) {
            return res.status(400).send({ status: false, msg: "blog not found" })
        }

        let idOfBlog = checkblog.map(blogs => {
        if (blogs.authorId.toString() === data2) return blogs._id;
        })

        const dataforUpdation = { isDeleted: true, deletedAt: Date.now() }

        const result = await blogsModel.updateMany({ _id:idOfBlog }, dataforUpdation, { new: true })

        if (!result) res.status(404).send({ status: false, msg: "No Data Found" })

        res.status(200).send({ status: true, msg: 'blog succesfully deleted', data: result })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



module.exports = {createBlog,getBlogs,updateBlogs,deleteBlogs,deleteByQuery}

