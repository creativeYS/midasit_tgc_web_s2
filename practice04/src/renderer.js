/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

document.getElementById('select').onclick = async () => {
    window.fileApi.selectAndDelete().then(
        (data) => {
            if (data) {
                document.getElementById('output').innerText = `${data ? 'deleted' : 'not deleted'}`;
            } else {
                document.getElementById('output').innerText = 'Invalid file path';
            }
        }
    );
}