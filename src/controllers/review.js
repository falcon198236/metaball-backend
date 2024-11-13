const mongoose = require('mongoose');
const { SystemActionType } = require('../constants/type');
const { UserHidenField } = require('../constants/security');
const Review = require('../models/review');

const SECTION = 'review';

// create a review with blog's id and content
const create = async(req, res) => {
    const {currentUser} = req;
    const { blog: blog_id, content } = req.body;
    const _review = await Review.findOne({user: currentUser._id, blog: blog_id}).catch(err=> console.log(err.message));
    if (_review) {
        return res.status(201).send({
            status: false,
            error: 'you alread reviewd',
        });
    }
    const blog = new mongoose.Types.ObjectId(blog_id);
    const review = new Review({
        user: currentUser._id,
        blog,
        content,
    });
    const result = await review.save().catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    
    return res.send({status: true, code: 200, data: result});
    
};

// udpate the review's content
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id, } = req.params;
    const { content } = req.body;
    const review = await Review.findOne({_id}).catch(err=> console.log(err.message));
    if (!review) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no review',
        })
    }
    const result = await Review.updateOne({_id}, {$set: {content}}).catch((err) => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    
    return res.send({status: true, code: 200, data: result});
};

// remove a review
const remove = async (req, res) => {
    const { _id } = req.params;
    const review = await Review.findOne({_id}).catch(err=> console.log(err.message));
    if (!review) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no review',
        });
    }
    const result = await Review.deleteOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    
    return res.send({status: true, code: 200, data: result});
};

// remove the selected reviews.
const removes = async (req, res) => {
    const { ids } = req.body;
    const result = await Review.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    
    return res.send({status: true, code: 200, data: result});
};


// get the review information
const get = async (req, res) => {
    const { _id } = req.params;
    const review = await Review.findOne({_id}).catch(err => console.log(err.message));
    if (!review) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: 'there is no blog',
        })
    }
    return res.send({
        status: true,
        code: 200,
        data: review,
    })
};

// get reviews for selected blog
const gets = async (req, res) => {
    const { currentUser } = req;
    const { _id: blog } = req.params;
    const { limit, skip, key} = req.query;
    const query = [{blog: new mongoose.Types.ObjectId(blog)}];
    if (key) {
        query.push({content: {$regex: `${key}`, $options:'i' }});
    }
    const count = await Review.countDocuments({$and: query});
    const reviews = await Review.find({$and: query}).populate({
        path: 'user',
        select: UserHidenField
    })
        .limit(limit)
        .skip(skip)
        .catch(err=> console.log(err.message));

    return res.send({ status: true, code: 200, data: {count, reviews} });
};


module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
}