module.exports = async function({data}, ws, inst) {
    if (data == "") {
        var arr = ws.websockets;
        var item = ws.get(req.params.instance)
        arr.splice(arr.indexOf(item), 1)
        ws.set(arr)
        try {
            await inst.stop();
        } catch {
            try {
                await inst.stop(true);
            } catch {

            }
        }
    }
}