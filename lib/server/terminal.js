const Client = require('@wolfogaming/node-lxd')(null, {})
const Docker = new (require('dockerode'))()
class Terminal {
    /**
     * @param {"docker" | "minecraft" | "N-VPS"} type 
     * @param {string} id 
     */
    constructor(type, id) {
        this._type = type;
        this._id = id
    }
    async connect() {
        return new Promise((resolve, reject) => {
            if (this._type == "N-VPS") {
                var ConsoleEmitter = require('streams')

            }
            else if (this._type == "minecraft") {
                var ConsoleEmitter = new (require('events')).EventEmitter
                Docker.getContainer(this._id).attach({
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true
                }, function (err, stream) {
                    stream.setEncoding('utf8')
                    stream.on('data', (data) => {
                        ConsoleEmitter.emit('data', data)
                    })
                    ConsoleEmitter.
                })
            }
            else if (this._type == "docker") {
                var ConsoleEmitter = new (require('events')).EventEmitter
                Docker.getContainer(this._id).attach({
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true
                }, function (err, stream) {
                    stream.setEncoding('utf8')
                    resolve(stream)
                })
            } else {
                reject(new Error('No type Specified'))
            }
        })
    }
}