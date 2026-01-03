const DEFAULT_FIELDS = [
    { key: 'id', label: 'ID', enabled: true, fixed: true },
    { key: 'title', label: 'Title', enabled: true },
    { key: 'difficulty', label: 'Difficulty', enabled: true },
    { key: 'url', label: 'URL', enabled: true },
    { key: 'timestamp', label: 'Timestamp', enabled: true },
    { key: 'submissions', label: 'Submissions', enabled: true }
];

let currentConfig = [];

document.addEventListener('DOMContentLoaded', async () => {
    const isValid = await checkUrl();
    if (!isValid) return;

    await loadConfig();
    renderFields();
    setupEventListeners();
});

async function checkUrl() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
        const url = tabs[0].url;
        if (!url.includes('leetcode.com/progress/')) {
            document.getElementById('mainContent').classList.add('hidden');
            document.getElementById('errorView').classList.remove('hidden');
            document.getElementById('redirectBtn').addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://leetcode.com/progress/' });
                window.close();
            });
            return false;
        }
    }
    return true;
}

async function loadConfig() {
    const result = await chrome.storage.local.get(['exportConfig']);
    if (result.exportConfig) {
        currentConfig = result.exportConfig;
    } else {
        currentConfig = JSON.parse(JSON.stringify(DEFAULT_FIELDS));
    }

    // Ensure ID is always present and first (safety check)
    const idIndex = currentConfig.findIndex(f => f.key === 'id');
    if (idIndex !== -1) {
        const idField = currentConfig.splice(idIndex, 1)[0];
        currentConfig.unshift(idField);
    } else {
        currentConfig.unshift({ key: 'id', label: 'ID', enabled: true, fixed: true });
    }
}

async function saveConfig() {
    await chrome.storage.local.set({ exportConfig: currentConfig });
}

function renderFields() {
    const list = document.getElementById('fieldList');
    list.innerHTML = '';

    currentConfig.forEach((field, index) => {
        const li = document.createElement('li');
        li.className = `field-item ${field.fixed ? 'fixed' : ''}`;
        li.setAttribute('draggable', !field.fixed);
        li.dataset.index = index;

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰';
        li.appendChild(dragHandle);

        const label = document.createElement('span');
        label.className = 'field-label';
        label.textContent = field.label;
        li.appendChild(label);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'field-checkbox';
        checkbox.checked = field.enabled;
        if (field.fixed) {
            checkbox.disabled = true;
        }
        checkbox.addEventListener('change', () => {
            field.enabled = checkbox.checked;
            saveConfig();
        });
        li.appendChild(checkbox);

        if (!field.fixed) {
            addDragHandlers(li);
        }

        list.appendChild(li);
    });
}

function addDragHandlers(li) {
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);
    li.addEventListener('dragend', handleDragEnd);
}

let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (dragSrcEl !== this) {
        const srcIndex = parseInt(dragSrcEl.dataset.index);
        const destIndex = parseInt(this.dataset.index);

        if (destIndex === 0) return false; // Cannot move above ID

        const itemObj = currentConfig.splice(srcIndex, 1)[0];
        currentConfig.splice(destIndex, 0, itemObj);

        saveConfig();
        renderFields();
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    const items = document.querySelectorAll('.field-item');
    items.forEach(function (item) {
        item.classList.remove('over');
    });
}

function setupEventListeners() {
    const coll = document.getElementById("toggleOptionsBtn");
    if (coll) {
        coll.addEventListener("click", function () {
            this.classList.toggle("active");
            const content = document.getElementById("optionsContent");
            content.classList.toggle("open");
        });
    }

    document.getElementById('startBtn').addEventListener('click', startExport);
    document.getElementById('stopBtn').addEventListener('click', stopExport);
}

function startExport() {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Starting export...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            statusDiv.textContent = 'Error: No active tab found.';
            return;
        }

        const activeTab = tabs[0];
        const exportFields = currentConfig.filter(f => f.enabled).map(f => f.key);

        chrome.tabs.sendMessage(activeTab.id, {
            action: 'start_export',
            fields: exportFields
        }, (response) => {
            if (chrome.runtime.lastError) {
                statusDiv.textContent = 'Error: Please refresh the LeetCode page.';
                console.error(chrome.runtime.lastError);
            } else {
                statusDiv.textContent = 'Export started...';
                document.getElementById('startBtn').classList.add('hidden');
                document.getElementById('stopBtn').classList.remove('hidden');
            }
        });
    });
}

function stopExport() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'stop_export' });
        document.getElementById('status').textContent = 'Export stopped by user.';
        resetButtons();
    });
}

function resetButtons() {
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'export_progress') {
        document.getElementById('status').textContent = request.message;
    } else if (request.action === 'export_complete') {
        document.getElementById('status').textContent = 'Export Complete!';
        resetButtons();
    } else if (request.action === 'export_error') {
        document.getElementById('status').textContent = 'Error: ' + request.message;
        resetButtons();
    }
});
