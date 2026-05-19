const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron');
const fs = require('fs');
const path = require('path');
const notesFilePath = path.join(app.getPath('userData'), 'notes.json');

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');

    // NEW: Hide window instead of closing
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    return mainWindow;
}

app.whenReady().then(() => {
    createWindow();

    // 1. APPLICATION MENU (Top bar)
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Note',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-new-note')
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => mainWindow.webContents.send('menu-open-file')
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-save')
                },
                {
                    label: 'Save As',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => mainWindow.webContents.send('menu-save-as')
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.isQuitting = true;
                        app.quit();
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // 2. SYSTEM TRAY (Taskbar icon)
    // Make sure 'tray-icon.png' exists in your folder!
    tray = new Tray(path.join(__dirname, 'tray-icon.png'));

    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });

    const trayMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('Quick Note Taker');
    tray.setContextMenu(trayMenu);

});

function readNotes() {
    if (!fs.existsSync(notesFilePath)) {
        return [];
    }
    const raw = fs.readFileSync(notesFilePath, 'utf-8');
    return JSON.parse(raw);
}

function writeNotes(notes) {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
}

// --- IPC HANDLERS ---
ipcMain.handle('save-as', async (event, text) => {
    const result = await dialog.showSaveDialog({
        title: 'Save Note As',
        defaultPath: path.join(app.getPath('documents'), 'quicknote.txt'),
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    if (result.canceled) return { success: false };
    fs.writeFileSync(result.filePath, text, 'utf-8');
    return { success: true, filePath: result.filePath };
});

ipcMain.handle('new-note', async () => {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Discard Changes', 'Cancel'],
        defaultId: 1,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Start a new note anyway?'
    });
    return { confirmed: result.response === 0 };
});

ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    if (result.canceled) return { success: false };
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, filePath };
});

ipcMain.handle('smart-save', async (event, text, filePath) => {
    const targetPath = filePath || path.join(app.getPath('documents'), 'quicknote.txt');
    fs.writeFileSync(targetPath, text, 'utf-8');
    return { success: true, filePath: targetPath };
});

ipcMain.handle('get-notes', () => {
    return readNotes();
});

ipcMain.handle('delete-notes', async (event, id) => {
    const notes = readNotes();
    const filtered = notes.filter(n => n.id !== id);
    writeNotes(filtered);
    return { success: true };
});

ipcMain.handle('save-note-json', async (event, note) => {
    const notes = readNotes();
    const Index = notes.findIndex(n => n.id === note.id);
    const now = new Date().toISOString();
    if (Index === -1) {
        notes.push({ ...note, createdAt: now, updatedAt: now });
    } else {
        notes[Index] = { ...note[index], ...note, updatedAt: now };
    }
    writeNotes(notes);
    return { success: true };
});
