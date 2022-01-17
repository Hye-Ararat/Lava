const { spawn } = require("child_process");

(async function setupLXD() {
    const installLXD = spawn("snap", "install lxd --channel=latest/stable".split(" "));

    installLXD.stdout.on('data', (data) => {
        console.log(data.toString())
    });
    installLXD.stderr.on('data', (data) => {
        console.log(data.toString())
    });
    installLXD.on("close", (code) => {
        const refreshLXD = spawn("snap", "refresh lxd --channel=latest/stable".split(" "));

        refreshLXD.stdout.on("data", (data) => {
            console.log(data.toString());
        })
        refreshLXD.stderr.on("data", (data) => {
            console.log(data.toString());
        })
        refreshLXD.on("close", (code) => {
            console.log("Done. Don't forget to run lxd init. When asked to create a network bridge, answer no, and when asked to create a storage pool keep all options default except the loop size (you can decide what you would like for that).");
            process.exit(0)
        })
    });
})();