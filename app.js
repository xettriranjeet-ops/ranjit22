// Get elements
const noteInput = document.getElementById("note");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");
const statusDiv = document.getElementById("status");

// Load saved note when page opens
window.onload = function () {
    const savedNote = localStorage.getItem("quickNote");
    if (savedNote) {
        noteInput.value = savedNote;
    }
    updateStatus("Note loaded from storage.");
};

// Auto-save functionality
let autoSaveTimeout;
noteInput.addEventListener("input", function () {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSave, 1000); // Auto-save after 1 second of inactivity
});

function autoSave() {
    const noteText = noteInput.value;
    localStorage.setItem("quickNote", noteText);
    updateStatus("Auto-saved.");
}

// Manual save
saveBtn.addEventListener("click", function () {
    const noteText = noteInput.value;

    if (noteText.trim() === "") {
        updateStatus("Note is empty! Nothing to save.", "error");
        return;
    }

    localStorage.setItem("quickNote", noteText);
    updateStatus("Note saved successfully!");
});

// Clear note
clearBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear the note?")) {
        noteInput.value = "";
        localStorage.removeItem("quickNote");
        updateStatus("Note cleared.");
    }
});

// Update status message
function updateStatus(message, type = "success") {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    setTimeout(() => {
        statusDiv.textContent = "";
    }, 3000);
}