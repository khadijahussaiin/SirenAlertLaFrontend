const sirenTableBody = document.querySelector('#sirens-table tbody');
const fireTableBody = document.querySelector('#fires-table tbody');
const popup = document.getElementById('popup');
const popupForm = document.getElementById('popup-form');

// Load data when page loads
window.onload = () => {
    loadSirens();
    loadFires();
};

function loadSirens() {
    fetch(`http://localhost:8080/sirens/api`)
        .then(res => res.json())
        .then(data => {
            sirenTableBody.innerHTML = '';
            data.forEach(siren => {
                const row = `<tr>
          <td>${siren.id}</td>
          <td>${siren.latitude}</td>
          <td>${siren.longitude}</td>
          <td class="${siren.status === 'FARE' ? 'status-fare' : siren.status === 'FRED' ? 'status-fred' : ''}">${siren.status}</td>
          <td>${siren.udeAfDrift}</td>
          <td>
            <button onclick='editSiren(${JSON.stringify(siren)})' class="btn-orange">Rediger</button>
            <button onclick='deleteSiren(${siren.id})' class="btn-red">Slet</button>
          </td>
        </tr>`;
                sirenTableBody.innerHTML += row;
            });
        });
}

function loadFires() {
    fetch(`http://localhost:8080/fires/status?status=active`)
        .then(res => res.json())
        .then(data => {
            fireTableBody.innerHTML = '';
            data.forEach(fire => {
                const sirens = fire.sirens.map(s => `#${s.id}`).join(', ');
                const row = `<tr>
          <td>${fire.latitude}</td>
          <td>${fire.longitude}</td>
          <td>${fire.createdAt || ''}</td>
          <td>${fire.closed ? 'Lukket' : 'Aktiv'}</td>
          <td>${sirens}</td>
          <td>
            <button class="close-button" onclick='confirmCloseFire(${fire.id})'>Luk brand</button>
          </td>
        </tr>`;
                fireTableBody.innerHTML += row;
            });
        });
}


function showSirenForm() {
    popupForm.reset();
    document.getElementById('popup-id').value = '';
    popup.classList.remove('hidden');
}

function editSiren(siren) {
    document.getElementById('popup-id').value = siren.id;
    document.getElementById('popup-lat').value = siren.latitude;
    document.getElementById('popup-lon').value = siren.longitude;
    document.getElementById('popup-status').value = siren.status;
    document.getElementById('popup-disabled').checked = siren.udeAfDrift;

    popup.classList.remove('hidden');
}

function closePopup() {
    popup.classList.add('hidden');
}

popupForm.onsubmit = function (e) {
    e.preventDefault();
    const id = document.getElementById('popup-id').value;
    const siren = {
        latitude: parseFloat(document.getElementById('popup-lat').value),
        longitude: parseFloat(document.getElementById('popup-lon').value),
        status: document.getElementById('popup-status').value,
        udeAfDrift: document.getElementById('popup-disabled').checked
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/sirens/update/${id}` : `http://localhost:8080/sirens/add`;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siren)
    }).then(() => {
        closePopup();
        loadSirens();
    });
};

function deleteSiren(id) {
    if (confirm('Er du sikker på, du vil slette denne sirene?')) {
        fetch(`http://localhost:8080/sirens/delete/${id}`, { method: 'DELETE' })
            .then(() => {
                loadSirens();  // allerede til stede
                loadFires();   // <-- tilføj denne linje
            });
    }
}


function createFire(e) {
    e.preventDefault();
    const latitude = parseFloat(document.getElementById('fire-lat').value);
    const longitude = parseFloat(document.getElementById('fire-lon').value);

    fetch(`http://localhost:8080/fires/add?latitude=${latitude}&longitude=${longitude}`, {
        method: 'POST'
    }).then(() => {
        loadFires();
        loadSirens();
    });
}
function closeFire(id) {
    fetch(`http://localhost:8080/fires/delete/${id}`, {
        method: 'DELETE'
    }).then(() => {
        loadFires();   // fjerner branden fra UI
        loadSirens();  // opdaterer sirenestatus
    });
}

function confirmCloseFire(id) {
    if (confirm('Er du sikker på, at du vil lukke branden? Alle tilknyttede sirener vil blive sat til FRED')) {
        closeFire(id);
    }
}

const firePopup = document.getElementById('fire-popup');
const firePopupForm = document.getElementById('fire-popup-form');

function showFireForm() {
    firePopupForm.reset();
    firePopup.classList.remove('hidden');
}

function closeFirePopup() {
    firePopup.classList.add('hidden');
}

firePopupForm.onsubmit = function (e) {
    e.preventDefault();
    const latitude = parseFloat(document.getElementById('fire-popup-lat').value);
    const longitude = parseFloat(document.getElementById('fire-popup-lon').value);

    fetch(`http://localhost:8080/fires/add?latitude=${latitude}&longitude=${longitude}`, {
        method: 'POST'
    }).then(() => {
        closeFirePopup();
        loadFires();
        loadSirens();
    });
};

