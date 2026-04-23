// Get elements
const noteInput = document.getElementById("note");
const saveBtn = document.getElementById("save");
const saveasBtn = document.getElementById("saveas");
const openFileBtn = document.getElementById("open-file");
const clearBtn = document.getElementById("clear");
const newNoteBtn = document.getElementById("new-note-btn");
const statusDiv = document.getElementById("status");
const saveIndicator = document.getElementById("save-indicator");
let lastSavedText = '';
// Load saved note when page opens
async function loadNote() {
    try {
        const result = await window.electronAPI.loadNote();
        if (result.success) {
            noteInput.value = result.note;
            lastSavedText = result.note;
            updateStatus("Note loaded from file.");
            updateSaveIndicator(true);
        } else {
            updateStatus("No saved note found.");
            updateSaveIndicator(false);
        }
    } catch (error) {
        updateStatus("Error loading note.", "error");
        updateSaveIndicator(false);
    }
}
loadNote();
// Auto-save functionality
let autoSaveTimeout;
noteInput.addEventListener("input", function () {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSave, 1000); // Auto-save after 1 second of inactivity
    updateSaveIndicator(false); // Mark as not saved when typing
});
async function autoSave() {
    const noteText = noteInput.value;
    try {
        const result = await window.electronAPI.saveNote(noteText);
        if (result.success) {
            lastSavedText = noteText;
            updateStatus("Auto-saved.");
            updateSaveIndicator(true);
        } else {
            updateStatus("Auto-save failed.", "error");
            updateSaveIndicator(false);
        }
    } catch (error) {
        updateStatus("Error during auto-save.", "error");
        updateSaveIndicator(false);
    }
}
// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Save as
    saveasBtn.addEventListener("click", async function () {
        const noteText = noteInput.value;
        if (noteText.trim() === "") {
            updateStatus("Note is empty! Nothing to save.", "error");
            return;
        }
        try {
            const result = await window.electronAPI.SaveAs(noteText);
            if (result.success) {
                lastSavedText = noteText;
                updateStatus("Note saved as successfully!");
                updateSaveIndicator(true);
            } else {
                updateStatus("Save as failed.", "error");
                updateSaveIndicator(false);
            }
        } catch (error) {
            updateStatus("Error saving note as.", "error");
            updateSaveIndicator(false);
        }
    });
    // Open file
    openFileBtn.addEventListener("click", async function () {
        try {
            const result = await window.electronAPI.openFile();
            if (result.success) {
                noteInput.value = result.contents;
                lastSavedText = result.contents;
                updateStatus("File loaded successfully.");
                updateSaveIndicator(true);
            } else {
                if (result.error !== 'Open cancelled') {
                    updateStatus("Open file failed.", "error");
                }
            }
        } catch (error) {
            updateStatus("Error opening file.", "error");
        }
    });
    // Clear note
    clearBtn.addEventListener("click", async function () {
        if (noteInput.value.trim() !== "") {
            const confirmed = await showWarningDialog("Are you sure you want to delete this note?", "Delete Note");
            if (!confirmed) return;
        }
        
        noteInput.value = "";
        try {
            const result = await window.electronAPI.clearNote();
            if (result.success) {
                lastSavedText = '';
                updateStatus("Note cleared.");
                updateSaveIndicator(false);
            } else {
                updateStatus("Clear failed.", "error");
            }
        } catch (error) {
            updateStatus("Error clearing note.", "error");
        }
    });
    // New note
    newNoteBtn.addEventListener("click", async function () {
        if (noteInput.value.trim() !== "") {
            const confirmed = await showWarningDialog("Do you want to make a new note? This will clear your current note.", "New Note");
            if (!confirmed) return;
        }
        
        noteInput.value = '';
        lastSavedText = '';
        updateStatus('New note created');
    });
});
// Update status message
function updateStatus(message, type = "success") {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    setTimeout(() => {
        statusDiv.textContent = "";
    }, 3000);
}
// Update save indicator
function updateSaveIndicator(saved) {
    const indicator = document.getElementById("save-indicator");
    if (saved) {
        indicator.textContent = "Saved";
        indicator.classList.add("saved");
    } else {
        indicator.textContent = "Not saved";
        indicator.classList.remove("saved");
    }
}

// Warning dialog function
function showWarningDialog(message, title = "Warning") {
    return new Promise((resolve) => {
        // Create dialog elements
        const dialog = document.createElement('div');
        dialog.className = 'warning-dialog-overlay';
        dialog.innerHTML = `
            <div class="warning-dialog">
                <div class="warning-dialog-header">
                    <span class="warning-icon">⚠️</span>
                    <h3 class="warning-title">${title}</h3>
                </div>
                <div class="warning-dialog-body">
                    <p class="warning-message">${message}</p>
                </div>
                <div class="warning-dialog-footer">
                    <button class="warning-btn warning-btn-cancel">Cancel</button>
                    <button class="warning-btn warning-btn-ok">OK</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .warning-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .warning-dialog {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                padding: 0;
                animation: fadeIn 0.2s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            .warning-dialog-header {
                display: flex;
                align-items: center;
                padding: 20px 20px 10px 20px;
                border-bottom: 1px solid #eee;
            }
            .warning-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            .warning-title {
                margin: 0;
                color: #d32f2f;
                font-size: 18px;
                font-weight: bold;
            }
            .warning-dialog-body {
                padding: 20px;
            }
            .warning-message {
                margin: 0;
                color: #333;
                line-height: 1.5;
            }
            .warning-dialog-footer {
                padding: 10px 20px 20px 20px;
                text-align: right;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            .warning-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            .warning-btn-cancel {
                background-color: #6c757d;
                color: white;
            }
            .warning-btn-cancel:hover {
                background-color: #5a6268;
            }
            .warning-btn-ok {
                background-color: #d32f2f;
                color: white;
            }
            .warning-btn-ok:hover {
                background-color: #b71c1c;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(dialog);

        // Handle button clicks
        const okBtn = dialog.querySelector('.warning-btn-ok');
        const cancelBtn = dialog.querySelector('.warning-btn-cancel');
        
        const closeDialog = (result) => {
            document.body.removeChild(dialog);
            document.head.removeChild(style);
            resolve(result);
        };

        okBtn.addEventListener('click', () => closeDialog(true));
        cancelBtn.addEventListener('click', () => closeDialog(false));

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
                document.head.removeChild(style);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}