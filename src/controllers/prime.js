const fs = require('fs');
const { SystemActionType } = require('../constants/type');
const Prime = require('../models/prime');

const SECTION = 'prime';

// create a Prime
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const prime = new Prime({
        user: currentUser._id,
        icon: _files[0] || '',
        ... req.body,
    });
    const result = await prime.save().catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    return res.send({status: true, data: result});
    
};

// update the selected prime
const update = async(req, res) => {
    const { _id, } = req.params;
    const _files = req.files?.map(f => f.path);
    
    const prime = await Prime.findOne({_id}).catch(err=> console.log(err.message));
    if (!prime) {
        return res.status(400).send({
            status: false,
            error: 'there is no prime',
        })
    }

    if (_files?.length > 0 && prime['icon']) {
        if(fs.existsSync(prime['icon'])) {
                fs.unlinkSync(prime['icon']);    
        }
    }
    const data = {... req.body};
    if (_files?.length) data.icon = _files[0];
    
    const result = await Prime.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    
    return res.send({status: true, data: result});
};

// remove a prime
const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    // const prime = await Prime.findOne({_id}).catch(err=> console.log(err.message));
    // if (!prime) {
    //     return {
    //         status: false,
    //         error: 'there is no prime',
    //     };
    // }
    // const f = prime['icon'];
    // if (f && fs.existsSync(f)) fs.unlinkSync(f);    

    const result = await Prime.updateOne({_id}, {$set: {deleted: true}}).catch(err =>{
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    })
    
    return res.send({status: true, data: result});
};



const removes = async (req, res) => {
    const { ids } = req.body;
    // const primes = await Prime.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    // primes.forEach(b => {
    //     if (b['icon']) {
    //         const f = b['icon'];
    //         if(fs.existsSync(f)) {
    //             fs.unlinkSync(f);    
    //         }
    //     }   
    // })
    const result = await Prime.updateMany({_id: {$in: ids}}, {$set: {deleted: true}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// get a Prime with _id
const get = async (req, res) => {
    const { _id } = req.params;
    const prime = await Prime.findOne({_id, deleted: false}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message
        });
    });

    return res.send({
        status: true,
        data: prime,
    });
};

// get Primes
const gets = async (req, res) => {
    const { _id } = req.params;
    const { key } = req.query;
    const query = {deleted: false};
    
    if (key) {
        query.title = {$regex: `${key}.*`, $options:'i' };
    }
    const count = await Prime.countDocuments(query);
    const primes = await Prime.find(query).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message
        });
    });

    return res.send({
        status: true,
        data: {
            count,
            primes
        }
    });
};

// change order
const change_order = (req, res) => {

}

module.exports = {
    create,
    update,
    remove,
    removes,
    get,
    gets,
    change_order,
}