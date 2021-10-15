module.exports = function install() {
  const Lxd = require('@wolfogaming/node-lxd')
  const prompts = require('prompts');
  const Ora = require('ora');
  const fs = require('fs');
  const Dockerode = require('dockerode')
  const docker = new Dockerode();
  const _ = require('lodash');
  setupEnv()
    async function setupEnv() {
    const panel_domain = await prompts({
      type: 'text',
      name: 'PANEL_DOMAIN',
      message: 'What is your panel domain?',
      validate: value => value != null || undefined,

    });
    const daemon_key = await prompts({
      type: 'password',
      name: 'DAEMON_KEY',
      message: `What is this Hye Lava Instance's unique key?`,
      validate: value => value != null || undefined,
    });
    const port = await prompts({
      type: 'number',
      name: 'PORT',
      message: `What port would you like Hye Lava to listen on?`,
      validate: value => value != null || undefined,
    });
    const daemon_domain = await prompts({
      type: 'text',
      name: 'DAEMON_DOMAIN',
      message: `What is this Hye Lava instance's domain?`,
      validate: value => value != null || undefined,
    });
    const cert_path = await prompts({
      type: 'text',
      name: 'CERT_PATH',
      message: `What is the path to this Hye Lava instance's SSL cert (fullchain in let's encrypt)?`,
      validate: value => value != null || undefined,
    });
    const cert_key = await prompts({
      type: 'text',
      name: 'CERT_KEY',
      message: `What is the path to this Hye Lava instance's SSL key (privkey in let's encrypt)?`,
      validate: value => value != null || undefined,
    });
    const Applying = Ora('Applying Configuration').start();
    const data = `PANEL_DOMAIN='${panel_domain.PANEL_DOMAIN}'\nDAEMON_KEY='${daemon_key.DAEMON_KEY}'\nPORT=${port.PORT}\nDEBUG=true\nVERSION='v0.0.1'\nDAEMON_DOMAIN='${daemon_domain.DAEMON_DOMAIN}'\nSSL_CERT='${cert_path.CERT_PATH}'\nSSL_KEY='${cert_key.CERT_KEY}'`
    fs.writeFile(`./.env`, data, err => {
      if (err) {
        Applying.fail('An error occured while writing the configuration.')
      } else {
        Applying.succeed('Configuration successfully applied. Please restart the application.')
      }

    })
  };
}