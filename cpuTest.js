const axios = require('axios')
const cgroup = require('cgroup-metrics');
const cpu = cgroup.cpu
function getCPU(id, callback){
    var client = axios.create({
        socketPath: "/var/snap/lxd/common/lxd/unix.socket"
    })
    client.get(`/1.0/instances/${id}/state`).then(function(response){
        callback(response.data)
    })
}
getCPU('win12', data => {
    console.log(data)
})
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
async function getCPUUsage(id, callback){
    var then_cpu = cpu.usage(id)
    await sleep(1000)
    var now_cpu = cpu.usage(id)
    const calculated_usage = await cpu.calculateUsage(then_cpu, now_cpu)
    console.log(calculated_usage)
    //looks about right, its an empty container
    //btw lxd cannot calculate CPU times for KVM instances
    //wait it does?
    //i hate that then
    //wolfo where is the JS script you posted to drama.gg?
    //the one that maxes out your CPU
    //you said 'ooh i made this in school" xD then posted it. Remember?
    //we can test with that
    //itll proly run in node
    //LOL U HAVE IT MEMORIZED
    //i was working on it lol
    //the problem is the cgroup thing is not accurate.
    //i dont believe it to be at least
    //we should test the cgroup first
    // getCPU(id, function(old_cpu){
    //     var now = Date.now()
    //     console.log(old_cpu)
    //     setTimeout(() => { 
    //         getCPU(id, function(new_cpu){
    //             console.log((new_cpu - old_cpu) / 8)
    //             var newDate = Date.now();
    //             console.log(newDate - now);
    //         })
    //     }, 1000);
    // })
}
getCPUUsage('test123')