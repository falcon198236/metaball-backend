const fs = require('fs');
const { SystemActionType } = require('../constants/type');
const Service = require('../models/service');

const SECTION = 'service';

// create a service
const create = async(req, res) => {
    const {currentUser} = req;
    const _files = req.files?.map(f => f.path);
    const service = new Service({
        user: currentUser._id,
        icon: _files[0] || '',
        ... req.body,
    });
    const result = await service.save().catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    });

    return res.send({status: true, data: result});
    
};

// update the selected service
const update = async(req, res) => {
    const { currentUser } = req;
    const { _id, } = req.params;
    const _files = req.files?.map(f => f.path);
    
    const service = await Service.findOne({_id}).catch(err=> console.log(err.message));
    if (!service) {
        return res.status(400).send({
            status: false,
            error: 'there is no service',
        })
    }

    if (_files?.length > 0 && service['icon']) {
        if(fs.existsSync(service['icon'])) {
                fs.unlinkSync(service['icon']);    
        }
    }
    const data = {... req.body};
    if (_files?.length) data.icon = _files[0];
    
    const result = await Service.updateOne({_id}, {$set: data}).catch((err) => {
        return res.status(400).send({
            status: false,
            error: err.message,
        });
    });
    
    return res.send({status: true, data: result});
};

// remove a service
const remove = async (req, res) => {
    const {currentUser} = req;
    const { _id } = req.params;
    const service = await Service.findOne({_id}).catch(err=> console.log(err.message));
    if (!service) {
        return {
            status: false,
            error: 'there is no service',
        };
    }
    const f = service['icon'];
    if (f && fs.existsSync(f)) fs.unlinkSync(f);    

    const result = await Service.deleteOne({_id}).catch(err =>{
        return res.status(400).send({
            status: false,
            error: err.message,
        })
    })
    
    return res.send({status: true, data: result});
};



const removes = async (req, res) => {
    const { ids } = req.body;
    const services = await Service.find({_id: {$in: ids}}).catch(err => console.log(err.message));
    services.forEach(b => {
        if (b['icon']) {
            b['icon']?.forEach(f => {
                if(fs.existsSync(f)) {
                    fs.unlinkSync(f);    
                }
            });
        }   
    })
    const result = await Service.deleteMany({_id: {$in: ids}}).catch(err => {
        return res.status(400).send({
            status: false,
            code: 400,
            error: err.message,
        });
    });
    return res.send({status: true, data: result});
};

// get a service with _id
const get = async (req, res) => {
    const { _id } = req.params;
    const service = await Service.findOne({_id}).catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message
        });
    });

    return res.send({
        status: true,
        data: service,
    });
};

// get services
const gets = async (req, res) => {
    const { _id } = req.params;
    const count = await Service.countDocuments();
    const services = await Service.find().catch(err => {
        return res.status(400).send({
            status: false,
            error: err.message
        });
    });

    return res.send({
        status: true,
        data: {
            count,
            services
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