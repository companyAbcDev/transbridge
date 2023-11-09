// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'kthulu-app',
        script: './server.js',
        instances: 5,
        exec_mode: 'cluster'
    }]
}