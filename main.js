const { app, BrowserWindow, ipcMain } = require('electron');

app.disableHardwareAcceleration();

const path = require('node:path');
const fs = require('node:fs');

function createWindow() {
    const Win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    Win.loadFile('index.html');
}

 app.whenReady().then(() => {
    
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

//IPC Handlers
ipcMain.handle('save-note', async (event, text) => {
    const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
    fs.writeFileSync(filePath, text, 'utf-8');
    return { success: true };
});

ipcMain.handle('load-note', async () => {
    const filePath = path.join(app.getPath('documents'), 'quicknote.txt');

ipcMain.handle('delete-note', async () => {
  const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return { success: true };
  }
  return { success: false, error: 'File not found' };
});

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(FilePath, 'utf-8');// ... existing load-note handler ends at line 43 ...




    }
    return '';

});