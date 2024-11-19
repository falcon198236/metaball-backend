const api = {
    SECURITY_KEY: process.env.SECURITY_KEY,
    SECURITY_ADMIN_KEY: process.env.SECURITY_ADMIN_KEY,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'admin@gmail.com',
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'betalball',
    SYSLOG_ENABLE: process.env.SYSLOG_ENABLE || 1
}
module.exports = api;