async function system(req, res) {
  res.json(
    require("../../lib/getStats").data[
      require("../../lib/getStats").data.length - 1
    ]
  );
}
module.exports = {
  system,
};
