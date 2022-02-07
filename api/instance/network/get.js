const { client } = require('../../../index');
const { convertID } = require("../../../lib/converter");
const { db } = require('../../../index');

module.exports = async (req, res) => {
    let instance;
    try {
        instance = await client.instance(convertID(req.params.instance));
    } catch (error) {
        return res.status(500).send("An error occured while fetching the instance");
    }
    if (!instance) return res.status(404).send("Instance not found");
    if (!db.collection("instances").exist(req.params.instance)) db.collection("instances").create(req.params.instance);
    const instanceData = db.collection("instances").get(req.params.instance);
    let address = {};
    console.log(instanceData);
    if (instanceData.ipv4_address && instanceData.ipv6_address) {
        address.ipv4_address = instanceData.ipv4_address;
        address.ipv6_address = instanceData.ipv6_address;
    } else {
        const ipv4 = await instance.ip("ipv4");
        const ipv6 = await instance.ip("ipv6");
        if (ipv4) {
            db.collection("instances").add(req.params.instance, { ipv4_address: ipv4 });
            address.ipv4_address = ipv4;
        }
        if (ipv6) {
            db.collection("instances").add(req.params.instance, { ipv6_address: ipv6 });
            address.ipv6_address = ipv6;
        }
    }
    if (address.ipv4_address || address.ipv6_address) {
        return res.status(200).send(address);
    } else {
        return res.status(500).send("This instance has never obtained an IP address");
    }
}