const axios = require("axios");
const { workerData, parentPort } = require("worker_threads");
const convertID = require("../../../../lib/lxd/convertID");
const sleep = require("../../../../lib/util/sleep");

var monitor_data = {
	status: null,
	usage: {
		cpu: null,
		memory: null,
		disk: null,
	},
	available: {
		cpu: null,
		memory: null,
		disk: null,
	},
};

async function serverMonitorWorker() {
	switch (workerData.type) {
		case "docker":
			const docker = new require("dockerode")();
			var container = await docker.getContainer(workerData.server);
			setInterval(async () => {
			var stats = await container.stats({stream: false});
			var container_data = await container.inspect();
			monitor_data.status = container_data.State.Status;
			var cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
			var systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
			var cpuPercent = (cpuDelta / systemDelta) * 100;
			monitor_data.usage.cpu = isNaN(cpuPercent) ? 0 : cpuPercent;
			monitor_data.usage.memory = stats.memory_stats.usage;
			parentPort.postMessage(monitor_data);
			}, 1000);
			break;
		case "n-vps":
		case "kvm":
			console.log("Started")
			var client = axios.create({
				socketPath: "/var/snap/lxd/common/lxd/unix.socket",
			});
			setInterval(async () => {
				try {
					var state = await client.get(
						`/1.0/instances/${convertID(workerData.server)}/state`
					);
				} catch (error) {
					console.log(error);
					return parentPort.postMessage(monitor_data);
				}
				state = state.data;
				if (state.metadata.status == "Running") {
					var start = Date.now();
					var startCpuUsage = state.metadata.cpu.usage / 1000000000;
					await sleep(1000);
					var state2 = await client.get(
						`/1.0/instances/${convertID(workerData.server)}/state`
					);
					state2 = state2.data;
					var endCpuUsage = state2.metadata.cpu.usage /1000000000;
					var nano = (endCpuUsage - startCpuUsage);
					var cpu_usage = (nano / (Date.now() - start)) * 12500;
					if (cpu_usage > 100){
						cpu_usage = 100;
					}
					monitor_data.status = state.metadata.status;
					monitor_data.usage.cpu = cpu_usage;
					monitor_data.usage.memory = state.metadata.memory.usage;
					monitor_data.usage.disk = state.metadata.disk.root.usage;
					parentPort.postMessage(monitor_data);
				} else {
					monitor_data.status = state.metadata.status;
					monitor_data.usage.cpu = 0;
					monitor_data.usage.memory = 0;
					monitor_data.usage.disk = state.metadata.disk.root.usage;
					parentPort.postMessage(monitor_data);
				}
			}, 1000);
			break;
	}
}
serverMonitorWorker();
