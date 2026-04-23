
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers for note operations
ipcMain.handle('save-note', async (event, note) => {
    try {
        const userDataPath = app.getPath('userData');
        const notePath = path.join(userDataPath, 'note.txt');
        await fs.writeFile(notePath, note, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-note', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const notePath = path.join(userDataPath, 'note.txt');
        const note = await fs.readFile(notePath, 'utf8');
        return { success: true, note };
    } catch (error) {
        return { success: false, note: '' };
    }
});

ipcMain.handle('clear-note', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const notePath = path.join(userDataPath, 'note.txt');
        await fs.unlink(notePath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-as', async (event, note) => {
    try {
        const result = await dialog.showSaveDialog({
            title: 'Save Note As',
            defaultPath: 'note.txt',
            filters: [{ name: 'Text Files', extensions: ['txt'] }]
        });
        if (!result.canceled) {
            await fs.writeFile(result.filePath, note, 'utf8');
            return { success: true };
        } else {
            return { success: false, error: 'Save cancelled' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-file', async () => {
    try {
        const result = await dialog.showOpenDialog({
            title: 'Open Text File',
            properties: ['openFile'],
            filters: [{ name: 'Text Files', extensions: ['txt'] }]
        });
        if (result.canceled || !result.filePaths.length) {
            return { success: false, error: 'Open cancelled' };
        }

        const filePath = result.filePaths[0];
        const contents = await fs.readFile(filePath, 'utf8');
        return { success: true, contents };
    } catch (error) {
        return { success: false, error: error.message };
    }
});