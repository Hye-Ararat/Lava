function generateService(s) {

    var service = `
    [Unit]
    Description=Hye lava daemon
    Documentation=https://hye.gg/
    After=network.target
    
    [Service]
    Type=simple
    User=root
    ExecStart=/usr/bin/node /srv/daemon/index.js
    Restart=on-failure
    WorkingDirectory=/srv/daemon
    
    [Install]
    WantedBy=multi-user.target
    `
    const fs = require('fs')
    try {
        fs.writeFileSync('/etc/systemd/system/lava.service', service)
    } catch (error) {
        console.log("Error while creating systemd service")
    }
    console.log('Created service\nStart the daemon with "systemctl daemon-reload && systemctl start lava"')
    if (process.env.USER != 'root') {
        console.log('Must be run as root')
        return process.exit(1)
    }

}
module.exports = generateService