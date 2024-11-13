const UserHidenField = {
    accesses: 0,
    last_login_at: 0,
    hash: 0,
    salt: 0, 
    __v: 0,
    updated_at: 0,
    created_at: 0,
    deleted: 0,
    follow_user_ids: 0,
    follow_blog_ids: 0,
    follow_rounding_ids: 0,
    role: 0,
};


const NormalHidenField = {
    __v: 0,
    updated_at: 0,
    created_at: 0,
}

module.exports = {
    UserHidenField,
    NormalHidenField,
}