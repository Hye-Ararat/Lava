const { getType } = require("../../../lib/server/getType");
const axios = require("axios");
//i added this when you see you'll know its there lol
const cgroup = require("cgroup-metrics");
const cpu = cgroup.cpu;
var check = {
  string: function string(string) {
    return string ? string : "";
  },
  integer: function integer(integer) {
    return integer ? integer : 0;
  },
};
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
var client = axios.create({
  socketPath: "/var/snap/lxd/common/lxd/unix.socket",
});
async function getState(id, callback) {
  var bytes = require("bytes");

  client.get(`/1.0/instances/${id}/state`).then(function (response) {
    console.log(JSON.stringify(response.data));
    client.get(`/1.0/instances/${id}`).then((data) => {
      console.log(JSON.stringify(data.data));
      callback({
        status: response.data.metadata.status,
        usage: {
          cpu: response.data.metadata.cpu.usage,
          memory: response.data.metadata.memory.usage,
          disk: response.data.metadata.disk.root.usage,
        },
        available: {
          cpu: parseInt(data.data.metadata.config["limits.cpu"]),
          memory: bytes.parse(data.data.metadata.config["limits.memory"]),
          disk: bytes.parse(data.data.metadata.expanded_devices.root.size),
        },
        raw: response,
      });
    });
  });
}
async function wsServerResources(ws, req) {
  var interval = req.query.interval ? req.query.interval : 1000;
  var type = await getType(req.params.uuid);
  if (type == "N-VPS") {
    var s = setInterval(() => {
      getState(req.params.uuid, async (state) => {
        console.log(state);
        var then_cpu = cpu.usage(req.params.uuid);
        await sleep(1000);
        var now_cpu = cpu.usage(req.params.uuid);
        console.log(state.available.cpu);
        const calculated_usage = await cpu.calculateUsage(then_cpu, now_cpu);
        ws.send(
          JSON.stringify({
            status: state.status,
            cpu: calculated_usage,
            memory: state.usage.memory,
            disk: state.usage.disk,
            netin: 0, //state.raw.data.metadata.network.eth0.counters.bytes_recieved,
            netout: 0, //state.raw.data.metadata.network.eth0.counters.bytes_sent
          })
        );
      });
    }, interval);
    ws.on("close", () => {
      clearInterval(s);
    });
  } else if (type == "KVM") {
    const usagecal = require("pidusage");
    var d = setInterval(() => {
      client
        .get(`/1.0/instances/${req.params.uuid}/state`)
        .then(function (response) {
          usagecal(response.data.metadata.pid).then((stats) => {
            ws.send(
              JSON.stringify({
                status: response.data.metadata.status,
                cpu: stats.cpu,
                memory: stats.memory,
                disk: check.integer(response.data.metadata.disk.root.usage),
                // net_in not going to ws??? yea wtf that does not make sense
                netin: check.integer(
                  response.data.metadata.network.eth0.counters.bytes_received
                ),
                netout: check.integer(
                  response.data.metadata.network.eth0.counters.bytes_sent
                ),
              })
            );
          });
        })
        .catch(function (error) {
          console.log(`idk what to do here L ${error}`);
        });
    }, interval);
    ws.on("close", () => {
      clearInterval(d);
    });
  } else if (type == "docker") {
    var e = setInterval(async () => {
      const DockerClient = new (require("dockerode"))();
      var s = DockerClient.getContainer(req.params.uuid);
      var statistics = await s.stats({ stream: false });
      var ins = await s.inspect();
      console.log(statistics);
      var cpuDelta =
        statistics.cpu_stats.cpu_usage.total_usage -
        statistics.precpu_stats.cpu_usage.total_usage;
      var systemDelta =
        statistics.cpu_stats.system_cpu_usage -
        statistics.precpu_stats.system_cpu_usage;
      var RESULT_CPU_USAGE = (cpuDelta / systemDelta) * 100;
      console.log(ins.State.Status);
      console.log(isNaN(RESULT_CPU_USAGE) ? 0 : RESULT_CPU_USAGE);
      ws.send(
        JSON.stringify({
          status: ins.State.Status,
          cpu: check.integer(isNaN(RESULT_CPU_USAGE) ? 0 : RESULT_CPU_USAGE),
          memory: check.integer(statistics.memory_stats.usage),
          disk: 0,
          netin: check.integer(
            ins.State.Status == "running"
              ? statistics.networks.eth0.rx_bytes
              : 0
          ),
          netout: check.integer(
            ins.State.Status == "running"
              ? statistics.networks.eth0.tx_bytes
              : 0
          ),
        })
      );
    }, interval);
    ws.on("close", () => {
      clearInterval(e);
    });
  } else {
    ws.deny();
  }
}
module.exports = { wsServerResources };
