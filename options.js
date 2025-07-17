// options.js

// DOM Elemente
const form = document.getElementById('entry-form');
const labelInput = document.getElementById('label');
const urlInput = document.getElementById('url');
const positionInput = document.getElementById('position');
const hideCheckbox = document.getElementById('hide-checkbox');
const submitBtn = document.getElementById('submit-btn');

const customList = document.getElementById('custom-list');
const hiddenList = document.getElementById('hidden-list');

let editIndex = null;      // null = neuer Eintrag, Zahl = bearbeiten

// Lade gespeicherte Einträge und rendere Listen
function render() {
  chrome.storage.sync.get(['customItems', 'hiddenItems'], (data) => {
    const customItems = data.customItems || [];
    const hiddenItems = data.hiddenItems || [];

    // Liste benutzerdefinierter Menüpunkte
    customList.innerHTML = '';
    customItems.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'entry-item';
      div.innerHTML = `
        <span><strong>${item.label}</strong> | URL: ${item.url} | Position: ${item.position}</span>
        <button class="edit" data-index="${i}">Bearbeiten</button>
        <button class="delete" data-index="${i}">Löschen</button>
      `;
      customList.appendChild(div);
    });

    // Liste versteckter Menüpunkte
    hiddenList.innerHTML = '';
    hiddenItems.forEach((label, i) => {
      const div = document.createElement('div');
      div.className = 'entry-item';
      div.innerHTML = `
        <span><strong>${label}</strong></span>
        <button class="edit-hidden" data-index="${i}">Bearbeiten</button>
        <button class="delete-hidden" data-index="${i}">Löschen</button>
      `;
      hiddenList.appendChild(div);
    });

    // Formular zurücksetzen
    resetForm();
  });
}

// Formular zurücksetzen
function resetForm() {
  labelInput.value = '';
  urlInput.value = '';
  positionInput.value = '';
  hideCheckbox.checked = false;
  submitBtn.textContent = 'Hinzufügen';
  editIndex = null;
}

// Formular absenden (Hinzufügen oder Speichern)
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const label = labelInput.value.trim();
  const url = urlInput.value.trim();
  const position = parseInt(positionInput.value, 10);
  const hide = hideCheckbox.checked;

  if (!label) {
    alert('Bitte ein Label eingeben.');
    return;
  }

  if (hide) {
    // Versteckter Menüpunkt (nur Label benötigt)
    chrome.storage.sync.get('hiddenItems', (data) => {
      let hiddenItems = data.hiddenItems || [];

      if (editIndex !== null) {
        // bearbeiten
        hiddenItems[editIndex] = label;
      } else {
        // neu
        if (!hiddenItems.includes(label)) {
          hiddenItems.push(label);
        }
      }

      chrome.storage.sync.set({ hiddenItems }, () => {
        render();
      });
    });

    // Wenn der Eintrag versteckt ist, soll er nicht gleichzeitig in customItems sein
    if (editIndex !== null) {
      // Entferne aus customItems, falls vorhanden (beim bearbeiten)
      chrome.storage.sync.get('customItems', (data) => {
        let customItems = data.customItems || [];
        if (editIndex !== null && customItems.length > editIndex) {
          // Aber Achtung: editIndex bezieht sich hier auf hiddenItems, deshalb hier keine Änderung
          // Deshalb nichts tun.
        }
      });
    }

  } else {
    // Benutzerdefinierter Menüpunkt (Label, URL, Position)
    chrome.storage.sync.get('customItems', (data) => {
      let customItems = data.customItems || [];

      if (editIndex !== null) {
        // bearbeiten
        customItems[editIndex] = { label, url, position };
      } else {
        // neu
        customItems.push({ label, url, position });
      }

      chrome.storage.sync.set({ customItems }, () => {
        render();
      });
    });

    // Beim Bearbeiten: versteckte Einträge nicht automatisch löschen (kann man erweitern)
  }
});

// Bearbeiten und Löschen für benutzerdefinierte Menüpunkte
customList.addEventListener('click', (e) => {
  if (e.target.matches('button.edit')) {
    const index = Number(e.target.dataset.index);
    chrome.storage.sync.get('customItems', (data) => {
      const item = (data.customItems || [])[index];
      if (!item) return;
      editIndex = index;
      labelInput.value = item.label;
      urlInput.value = item.url;
      positionInput.value = item.position;
      hideCheckbox.checked = false;
      submitBtn.textContent = 'Speichern';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else if (e.target.matches('button.delete')) {
    const index = Number(e.target.dataset.index);
    chrome.storage.sync.get('customItems', (data) => {
      let customItems = data.customItems || [];
      customItems.splice(index, 1);
      chrome.storage.sync.set({ customItems }, () => {
        render();
      });
    });
  }
});

// Bearbeiten und Löschen für versteckte Menüpunkte
hiddenList.addEventListener('click', (e) => {
  if (e.target.matches('button.edit-hidden')) {
    const index = Number(e.target.dataset.index);
    chrome.storage.sync.get('hiddenItems', (data) => {
      const label = (data.hiddenItems || [])[index];
      if (!label) return;
      editIndex = index;
      labelInput.value = label;
      urlInput.value = '';
      positionInput.value = '';
      hideCheckbox.checked = true;
      submitBtn.textContent = 'Speichern';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else if (e.target.matches('button.delete-hidden')) {
    const index = Number(e.target.dataset.index);
    chrome.storage.sync.get('hiddenItems', (data) => {
      let hiddenItems = data.hiddenItems || [];
      hiddenItems.splice(index, 1);
      chrome.storage.sync.set({ hiddenItems }, () => {
        render();
      });
    });
  }
});

// Seite fertig laden -> render aufrufen
document.addEventListener('DOMContentLoaded', render);

const customFields = document.getElementById("visible-fields");

hideCheckbox.addEventListener("change", () => {
  customFields.style.display = hideCheckbox.checked ? "none" : "block";
});

