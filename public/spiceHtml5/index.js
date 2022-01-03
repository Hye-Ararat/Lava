import * as SpiceHtml5 from './src/main.js';
class SpiceConnection {
    connect() {
        return new SpiceHtml5.SpiceMainConn({uri: this.url, screen_id: this.screen_id, password: '', onerror: this.onerror, onagent: this.onagent })
    }
    constructor(url,screen_id,onerror,onagent){
        this.url = url;
        this.screen_id = screen_id;
        this.onerror = onerror;
        this.onagent = onagent;
    }
}