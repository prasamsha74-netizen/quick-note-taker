let currentFilePath = null;
let lastSavedText = '';

const textarea = document.getElementById('editor');
const statusEl = document.getElementById('status');
const saveBtn = document.getElementById('save');
const saveAsBtn = document.getElementById('save-as');
const newNoteBtn = document.getElementById('new-note');
const openFileBtn = document.getElementById('open-file');


document.getElementById('new-note').addEventListener('click', async () => {
    if (textarea.value === lastSavedText) {
        textarea.value = '';
        currentFilePath = null;
        statusEl.textContent = 'New note started.';
        return;
    }
    const result = await window.electronAPI.newNote();
    if (result.confirmed) {
        textarea.value = '';
        lastSavedText = '';
        currentFilePath = null;
        statusEl.textContent = 'New note started.';
    } else {
        statusEl.textContent = 'New note cancelled.';
    }
});

document.getElementById('open-file').addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
    if (result.success) {
        textarea.value = result.content;
        lastSavedText = result.content;
        currentFilePath = result.filePath;
        statusEl.textContent = `Opened: ${result.filePath}`;
    } else {
        statusEl.textContent = 'Failed to open file.';
    }
});

document.getElementById('save').addEventListener('click', async () => {
    const result = await window.electronAPI.smartSave(textarea.value, currentFilePath);
    if (result.success) {
        lastSavedText = textarea.value;
        currentFilePath = result.filePath;
        statusEl.textContent = `Saved to: ${result.filePath}`;
    } else {
        statusEl.textContent = 'Failed to save file.';
    }
});

document.getElementById('save-as').addEventListener('click', async () => {
    const result = await window.electronAPI.saveAs(textarea.value);
    if (result.success) {
        lastSavedText = textarea.value;
        currentFilePath = result.filePath;
        statusEl.textContent = `Saved to: ${result.filePath}`;
    } else {
        statusEl.textContent = 'Failed to save file.';
    }
});
// --- ADD THIS AT THE BOTTOM ---

// These "listen" for the menu clicks and click your UI buttons for you
window.electronAPI.onMenuAction('menu-new-note', () => {
    newNoteBtn.click();
});

window.electronAPI.onMenuAction('menu-open-file', () => {
    openFileBtn.click();
});

window.electronAPI.onMenuAction('menu-save', () => {
    saveBtn.click();
});

window.electronAPI.onMenuAction('menu-save-as', () => {
    saveAsBtn.click();
});
window.electronAPI.onMenuAction('menu-quit', () => {
    quitBtn.click();
});