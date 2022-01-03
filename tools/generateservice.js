var pwd = process.env.PWD.split('/')
pwd.pop()
if (process.env.USER != 'root') {
    console.log('Must be run as root')
    return process.exit(1)
}
var service = `
[Unit]
Description=Hye lava daemon
Documentation=https://hye.gg/
After=network.target

[Service]
Type=simple
User=${process.env.USER}
ExecStart=/usr/bin/node ${pwd.join('/')}/index.js
Restart=on-failure
WorkingDirectory=${pwd.join('/')}

[Install]
WantedBy=multi-user.target
`
const fs =require('fs')
try {
    fs.writeFileSync('/etc/systemd/system/lava.service', service)
} catch (error) {
   console.log(error) 
}
console.log('Created service\nStart the daemon with "systemctl daemon-reload && systemctl start lava"')