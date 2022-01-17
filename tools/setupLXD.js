const {spawn} = require("child_process");
const readline = require("readline");

(async function setupLXD(){
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
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })

            var storage;

            rl.question("How much storage would you like Ararat to have access to (Example: 5GB)? ", (answer) => {
                storage = answer;
                rl.close();

                const setupLXD = spawn("lxd", ["init"]);
                setupLXD.stdout.on("data", (data) => {
                console.log(data.toString());
})
                setupLXD.stdin.write(" \n")
                setupLXD.stdin.write(" \n")
                setupLXD.stdin.write(" \n")
                setupLXD.stdin.write(" \n")
                setupLXD.stdin.write(" \n")
                setupLXD.stdin.write(" \n")
                setupLXD.stdin.write(storage + "\n")
                setupLXD.stdin.write(" \n");
                setupLXD.stdin.write("no\n");
                setupLXD.stdin.write(" \n");
                setupLXD.stdin.write(" \n");
                setupLXD.stdin.write(" \n");
                setupLXD.stdin.write(" \n");
                setupLXD.on("close", (code) => {
                    console.log(code);
                    console.log("LXD installed")
                    process.exit(0);
                })
            })
        })
    });
})();