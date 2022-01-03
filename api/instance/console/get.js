function spice(req,res) {
    res.render('spice', {server: req.params.instance})
}
module.exports = spice