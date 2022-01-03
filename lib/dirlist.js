
var https = require('https')

var mime = require('mime-types')
const Fs = require('fs')
const { client } = require('..')
const { convertID } = require('./converter')
const {Worker} = require('worker_threads')



//var path = '/root'

async function getFilesize(name, path) {


        const url = encodeURI("/1.0/instances/"+convertID(name)+"/files?path=" + path)
console.log("/1.0/instances/"+convertID(name)+"/files?path=" + path)
            const { data, headers } = await client.client.axios({
                url,
                method: 'GET',
                responseType: 'stream',
                validateStatus: false
            })
            if (headers['x-lxd-type'] == "directory") {
                return null
            } else {
                return {
                    size: parseInt(headers['content-length']),
                    mode: headers['x-lxd-mode']
                }
            }
        




}
async function getDirList(name, path) {
    return new Promise(async (resolve, reject) => {
        console.log('dirlist')
        const url = encodeURI("/1.0/instances/"+convertID(name)+"/files?path=" + path)
        const { data, headers } = await client.client.axios({
            url,
            validateStatus: false
        })
        console.log(data)
        if (headers['x-lxd-type'] == "directory") {
            //need here
            //so you just need it to wait for each iteration? and then return the array it made ender i think i know smth better why dont
            function sliceIntoChunks(arr, chunkSize) {
                const res = [];
                for (let i = 0; i < arr.length; i += chunkSize) {
                    const chunk = arr.slice(i, i + chunkSize);
                    res.push(chunk);
                }
                return res;
            }
           var news = []
           var shit = sliceIntoChunks(data.metadata, 2)
            console.log(shit)
            var count = 0 
            shit.forEach(async s => {
                console.log(s)
                  s.forEach(async thing => {
                      console.log( 'ok boomer')
                    var size = await getFilesize(name, path + '/' + thing)
                    console.log(size)
                    if (size == null) {
                        var opt = {
                            type: 'directory'
                        }
                    } else {
                        var mimes = mime.lookup(thing)
                        if (mime.lookup(thing) == false) mimes = 'text/plain'
                        var opt = {
                            type: 'file',
                            mime: mimes
                    }
                    }
                    console.log(thing)
                    news.push({
                        ...opt,
                        ...size,
                        name: thing
                    })
                    count++
                    console.log(count, data.metadata.length)
                  });
                
            });
            
    
            var i = setInterval(() => {
                if (count == data.metadata.length) {
                    clearInterval(i)
                    console.log('ok')
                    resolve(news.filter(s => {
                        console.log('fileter')
                        if (s === null) {
                            return false
                        } else {
                            return true
                        }
                    }))
                }

            }, 50);
    
            
    
        } else {
            resolve(null)
        }
    })
   
}
module.exports = {getDirList, getFilesize}