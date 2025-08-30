// provider-agnostic adapter: currently dummy + hooks; extend for Twilio/Gupshup/WATI as needed
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const dataPath = path.join(__dirname, '..', 'data');
if(!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
const dummyFile = path.join(dataPath, 'messages.json');
if(!fs.existsSync(dummyFile)) fs.writeFileSync(dummyFile, '[]');

class MsgAdapter extends EventEmitter {
  async sendWhatsApp(to, text){
    // simple dummy persist
    const arr = JSON.parse(fs.readFileSync(dummyFile,'utf8'));
    const msg = { id: Date.now(), to, text, time: new Date().toISOString(), via: 'dummy' };
    arr.push(msg);
    fs.writeFileSync(dummyFile, JSON.stringify(arr, null, 2));
    this.emit('sent', msg);
    return msg;
  }
}

module.exports = new MsgAdapter();
