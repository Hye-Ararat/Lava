/**
 * Converts Ararat Server ID to LXD Container ID
 */
function convertID(id) {
    return id.replace(/[^a-zA-Z]/g, "");
}
module.exports = convertID;
