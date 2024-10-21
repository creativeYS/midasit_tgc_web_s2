/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
const { ipcRenderer } = require('electron')

ipcRenderer.send('ping1', 'ping')

ipcRenderer.on('ping1-reply', (event, arg) => {
    console.log('renderer async : ', arg) // "pong" 출력
})

const response = ipcRenderer.sendSync('ping2', 'ping');
console.log('renderer sync : ', response) // "pong" 출력

ipcRenderer.invoke('ping3', 'ping').then((data)=>{
    console.log('renderer async invoke : ', data);
})