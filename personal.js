import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    setPersistence,
    browserLocalPersistence,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Credenciales del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyAquJSwYWNVzCNlHfCFb5p9dnpcXGOyt_s",
  authDomain: "quickgoxpress-app.firebaseapp.com",
  projectId: "quickgoxpress-app",
  storageBucket: "quickgoxpress-app.firebasestorage.app",
  messagingSenderId: "685067522398",
  appId: "1:685067522398:web:37d03fd527695db491bfcf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// INYECCIÓN DE ESTILOS: Scrollbar, Tarjetas e Imagen de Carros
const adaptiveScrollStyle = document.createElement('style');
adaptiveScrollStyle.innerHTML = `
    .sync-scroll-card {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
    }

    @media (min-width: 769px) {
        .sync-scroll-card::-webkit-scrollbar {
            height: 8px;
            display: block;
        }
        .sync-scroll-card::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 4px;
        }
        .sync-scroll-card::-webkit-scrollbar-thumb {
            background: var(--neon-blue, #00f2ff);
            border-radius: 4px;
            box-shadow: 0 0 5px rgba(0, 242, 255, 0.5);
        }
        .sync-scroll-card::-webkit-scrollbar-thumb:hover {
            background: #00c8d6;
        }
    }

    @media (max-width: 768px) {
        .sync-scroll-card {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .sync-scroll-card::-webkit-scrollbar {
            display: none;
        }
    }

    /* Grid para las tarjetas estilo Marketplace */
    .cars-grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
        gap: 1.5rem;
        width: 100%;
        margin-top: 1rem;
    }

    .car-card-item {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(0, 242, 255, 0.3);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        transition: transform 0.2s ease, border-color 0.2s ease;
        display: flex;
        flex-direction: column;
    }

    .car-card-item:hover {
        border-color: var(--neon-blue, #00f2ff);
        transform: translateY(-4px);
    }

    .car-card-image-box {
        position: relative;
        width: 100%;
        height: 180px;
        background: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .car-card-img-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .car-image-upload-label {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
    }

    .car-image-upload-label:hover::after {
        content: "Cambiar Imagen";
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        color: #00f2ff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: bold;
    }

    .car-card-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #0a0f1d;
        color: #00f2ff;
        border: 1px solid #00f2ff;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 6px;
        text-transform: uppercase;
        z-index: 2;
    }

    .car-card-delete-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid #ff0055;
        color: #ff0055;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
        z-index: 2;
    }

    .car-card-delete-btn:hover {
        background: #ff0055;
        color: #fff;
    }

    .car-card-body {
        padding: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
    }

    .car-card-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
        font-family: 'Rajdhani', sans-serif;
    }

    .car-tag-pill {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        color: #e2e8f0;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }

    .car-card-field-group {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .car-card-label {
        font-size: 0.7rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .car-input-field {
        background: rgba(0,0,0,0.4) !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        color: #fff !important;
        border-radius: 6px !important;
        padding: 5px 8px !important;
        font-size: 0.82rem !important;
    }

    .car-input-field:focus {
        border-color: #00f2ff !important;
        outline: none;
    }
`;
document.head.appendChild(adaptiveScrollStyle);

let tempBase64Photo = null;
let invoiceSearchQuery = '';
const autoSaveDebounceTimers = {};
const carAutoSaveTimers = {};

setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Error al configurar la persistencia:", err);
});

// ==========================================
// ESTADO GLOBAL Y MEMORIA
// ==========================================
let state = {
    currentUser: null,
    userProfile: null,
    personnel: [],
    cars: [],
    invoices: [],
    importantFiles: [],
    lastInvoiceCalc: null
};

function usernameToEmail(username) {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    return `${cleanUsername}@quickgoxpress.local`;
}

function isValidPassword(password) {
    return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

// ==========================================
// CONTROL DEL MODAL DE MAPA
// ==========================================
const mapModal = document.getElementById('mapModal');
const closeMapModalBtn = document.getElementById('closeMapModalBtn');

closeMapModalBtn?.addEventListener('click', () => {
    if (mapModal) mapModal.classList.remove('active');
    const iframe = document.getElementById('mapIframe');
    if (iframe) iframe.src = ''; 
});

function openRouteMap(pickup, delivery, vehicleModel) {
    if (!pickup || !delivery) {
        alert("Debes ingresar la ciudad de Recogida y Entrega para ver la ruta en el mapa.");
        return;
    }

    const titleEl = document.getElementById('mapModalTitle');
    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-route" style="color: #00f2ff;"></i> Ruta: ${pickup} ➔ ${delivery} (${vehicleModel})`;
    }

    const originEnc = encodeURIComponent(pickup);
    const destinationEnc = encodeURIComponent(delivery);
    const freeMapUrl = `https://www.google.com/maps?q=from+${originEnc}+to+${destinationEnc}&output=embed`;

    const iframe = document.getElementById('mapIframe');
    if (iframe) {
        iframe.src = freeMapUrl;
    }

    if (mapModal) mapModal.classList.add('active');
}

// ==========================================
// ANIMACIÓN DE FONDO (CANVAS)
// ==========================================
const canvas = document.getElementById('bgCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        color: Math.random() > 0.5 ? '#00f2ff' : '#ff0055'
    }));

    function animateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 255, ${1 - dist / 110})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
}

// ==========================================
// ESCUCHADOR DE SESIÓN Y CARGA DESDE LA NUBE
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.currentUser = user;
        await loadUserData(user.uid);
        updateAuthUI(true);
        renderPersonnel();
        renderCars();
        renderInvoices();
        navigateTo('view-dashboard');
    } else {
        state.currentUser = null;
        state.userProfile = null;
        state.personnel = [];
        state.cars = [];
        state.invoices = [];
        state.importantFiles = [];
        updateAuthUI(false);
        renderPersonnel();
        renderCars();
        renderInvoices();
        navigateTo('view-home');
    }
});

async function loadUserData(uid) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            state.userProfile = userDocSnap.data();
        }

        const pSnap = await getDocs(collection(db, 'users', uid, 'personnel'));
        state.personnel = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const cSnap = await getDocs(collection(db, 'users', uid, 'cars'));
        state.cars = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const iSnap = await getDocs(collection(db, 'users', uid, 'invoices'));
        state.invoices = iSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const fSnap = await getDocs(collection(db, 'users', uid, 'importantFiles'));
        state.importantFiles = fSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn("Error cargando datos de Firebase:", err);
    }
}

// ==========================================
// CONTROL DE NAVEGACIÓN
// ==========================================
const sideDrawer = document.getElementById('sideDrawer');
const overlay = document.getElementById('overlay');

function toggleDrawer() {
    if (sideDrawer) sideDrawer.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

document.getElementById('openDrawerBtn')?.addEventListener('click', toggleDrawer);
document.getElementById('closeDrawerBtn')?.addEventListener('click', toggleDrawer);
overlay?.addEventListener('click', toggleDrawer);

function navigateTo(targetId) {
    if (!state.currentUser && targetId !== 'view-home' && targetId !== 'view-settings') {
        alert('Por favor inicia sesión primero.');
        return;
    }

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');

    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-target') === targetId);
    });

    if (sideDrawer?.classList.contains('open')) toggleDrawer();

    if (targetId === 'view-dashboard') renderPersonnel();
    if (targetId === 'view-my-cars') renderCars();
    if (targetId === 'view-invoices-list') renderInvoices();
}

document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id === 'logoutBtn') return;
        e.preventDefault();
        navigateTo(link.getAttribute('data-target'));
    });
});

document.getElementById('goRegisterBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('view-settings');
});

function updateAuthUI(isLoggedIn) {
    const badge = document.getElementById('headerStatusBadge');
    const text = document.getElementById('headerStatusText');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    const settingsMenuItem = document.getElementById('settingsMenuItem');
    const homeMenuItem = document.getElementById('homeMenuItem');
    
    const lockedLinks = [
        document.getElementById('linkProfile'),
        document.getElementById('linkPersonnel'),
        document.getElementById('linkMyCars'),
        document.getElementById('linkCreateInvoice'),
        document.getElementById('linkInvoicesList'),
        document.getElementById('linkFiles')
    ];

    if (isLoggedIn && state.currentUser) {
        const name = state.userProfile?.fullName || state.currentUser.displayName || 'Usuario';
        if (badge) badge.className = 'header-status status-logged-in';
        if (text) text.textContent = name;
        lockedLinks.forEach(l => l?.classList.remove('locked'));
        if (logoutMenuItem) logoutMenuItem.style.display = 'block';
        if (settingsMenuItem) settingsMenuItem.style.display = 'none';
        if (homeMenuItem) homeMenuItem.style.display = 'none';

        const dashOwner = document.getElementById('dashOwnerName');
        if (dashOwner) dashOwner.textContent = name;
        const editName = document.getElementById('editProfileName');
        if (editName) editName.value = name;

        const avatarImg = document.getElementById('profileAvatarImg');
        if (avatarImg && state.userProfile?.photoURL) {
            avatarImg.src = state.userProfile.photoURL;
        }
    } else {
        if (badge) badge.className = 'header-status status-logged-out';
        if (text) text.textContent = 'Desconectado';
        lockedLinks.forEach(l => l?.classList.add('locked'));
        if (logoutMenuItem) logoutMenuItem.style.display = 'none';
        if (settingsMenuItem) settingsMenuItem.style.display = 'block';
        if (homeMenuItem) homeMenuItem.style.display = 'block';
    }
}

// ==========================================
// AUTENTICACIÓN Y CUENTAS
// ==========================================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    } catch (err) {
        alert('Credenciales incorrectas: ' + err.message);
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim().toLowerCase();
    const name = document.getElementById('regFullName').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!isValidPassword(password)) {
        alert('La contraseña debe incluir letras y números.');
        return;
    }

    try {
        const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, 'users', cred.user.uid), { username, fullName: name });
        alert('Cuenta creada exitosamente.');
    } catch (err) {
        alert('Error al registrar usuario: ' + err.message);
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
});

// ==========================================
// CONFIGURACIÓN DE PERFIL Y FOTO
// ==========================================
document.getElementById('avatarFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1 * 1024 * 1024) {
            alert("La imagen es demasiado pesada. Elige una foto de menos de 1 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            tempBase64Photo = event.target.result;
            const imgElement = document.getElementById('profileAvatarImg');
            if (imgElement) {
                imgElement.src = tempBase64Photo;
            }
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('editProfileName').value.trim();
    if (!newName || !state.currentUser) return;

    try {
        await updateProfile(state.currentUser, { displayName: newName });

        const dataToSave = { fullName: newName };
        if (tempBase64Photo) {
            dataToSave.photoURL = tempBase64Photo;
        }

        await setDoc(doc(db, 'users', state.currentUser.uid), dataToSave, { merge: true });

        state.userProfile = {
            ...state.userProfile,
            ...dataToSave
        };

        updateAuthUI(true);
        tempBase64Photo = null;
        alert('Perfil y foto actualizados correctamente.');
    } catch (err) {
        console.error("Error al actualizar perfil:", err);
        alert('Error actualizando perfil: ' + err.message);
    }
});

// ==========================================
// GESTIÓN DE PERSONAL
// ==========================================
const addPersonModal = document.getElementById('addPersonModal');

document.getElementById('openAddPersonModalBtn')?.addEventListener('click', () => {
    if (addPersonModal) addPersonModal.classList.add('active');
});

document.getElementById('closeAddPersonModalBtn')?.addEventListener('click', () => {
    if (addPersonModal) addPersonModal.classList.remove('active');
});

function generateUniqueCode() {
    let code;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (state.personnel.some(p => p.code === code));
    return code;
}

document.getElementById('addPersonForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.currentUser) {
        alert("Error: Debes iniciar sesión primero.");
        return;
    }

    const nameVal = document.getElementById('newPersonName').value.trim();
    const percentVal = parseFloat(document.getElementById('newPersonPercent').value);
    const roleVal = document.getElementById('newPersonRole').value.trim();

    if (!nameVal || isNaN(percentVal) || !roleVal) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const newWorker = {
        name: nameVal,
        percent: percentVal,
        role: roleVal,
        code: generateUniqueCode(),
        createdAt: new Date().toISOString()
    };

    try {
        const docRef = await addDoc(collection(db, 'users', state.currentUser.uid, 'personnel'), newWorker);
        newWorker.id = docRef.id;
        state.personnel.push(newWorker);
        renderPersonnel();

        document.getElementById('addPersonForm').reset();
        if (addPersonModal) addPersonModal.classList.remove('active');
    } catch (err) {
        console.error("Error guardando en Firebase:", err);
        alert("Error al guardar en la nube: " + err.message);
    }
});

function renderPersonnel() {
    const container = document.getElementById('personnelContainer');
    const badge = document.getElementById('personnelCountBadge');

    if (!container) return;

    container.innerHTML = '';
    if (badge) badge.textContent = `${state.personnel.length} Registrados`;

    if (state.personnel.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px;">
                No hay personal en la lista. Haz clic en el botón <strong>"+"</strong> para crear la primera tarjeta.
            </div>
        `;
        return;
    }

    state.personnel.forEach((p, index) => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85));
            border: 2px solid var(--neon-blue);
            border-radius: 14px;
            padding: 1.2rem;
            margin-bottom: 1.2rem;
            box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
            position: relative;
            overflow: hidden;
        `;

        card.innerHTML = `
            <div style="position: absolute; top:0; left:0; width: 6px; height: 100%; background: var(--neon-blue);"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; margin-bottom: 0.8rem;">
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: block;">Nombre Completo</span>
                    <strong style="font-size: 1.25rem; color: #fff; font-family: 'Rajdhani', sans-serif;">
                        <i class="fa-solid fa-user-check" style="color: var(--neon-blue); margin-right: 6px;"></i> ${p.name}
                    </strong>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: block;">Código Único</span>
                        <span style="background: #00f2ff; color: #000; font-weight: 900; font-size: 1.1rem; padding: 4px 10px; border-radius: 6px; font-family: 'Orbitron', monospace; letter-spacing: 2px; display: inline-block;">
                            ${p.code}
                        </span>
                    </div>
                    
                    <button class="btn-delete-person" data-index="${index}" data-id="${p.id || ''}" style="background: rgba(255, 0, 85, 0.2); border: 1px solid #ff0055; color: #ff0055; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;" title="Eliminar Integrante">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 8px;">
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Rol / Cargo:</span>
                    <strong style="color: #e2e8f0; font-size: 0.95rem;">
                        <i class="fa-solid fa-briefcase" style="color: var(--neon-blue); margin-right: 4px;"></i> ${p.role}
                    </strong>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Porcentaje:</span>
                    <strong style="color: #00ff66; font-size: 1.2rem; font-family: 'Orbitron', monospace;">
                        ${p.percent}%
                    </strong>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    setupDeleteEvents();
}

function setupDeleteEvents() {
    document.querySelectorAll('.btn-delete-person').forEach(btn => {
        btn.addEventListener('click', async () => {
            const index = parseInt(btn.getAttribute('data-index'));
            const docId = btn.getAttribute('data-id');
            const targetWorker = state.personnel[index];

            if (!targetWorker) return;

            if (!confirm(`¿Estás seguro de borrar a "${targetWorker.name}"?`)) return;

            try {
                if (docId && state.currentUser) {
                    await deleteDoc(doc(db, 'users', state.currentUser.uid, 'personnel', docId));
                }
                state.personnel.splice(index, 1);
                renderPersonnel();
            } catch (err) {
                console.error("Error eliminando documento:", err);
            }
        });
    });
}

// ==========================================
// GESTIÓN DE MIS CARROS / VEHÍCULOS (CON MAPA INTERACTIVO)
// ==========================================
const addCarModal = document.getElementById('addCarModal');

document.getElementById('openAddCarModalBtn')?.addEventListener('click', () => {
    if (addCarModal) addCarModal.classList.add('active');
});

document.getElementById('closeAddCarModalBtn')?.addEventListener('click', () => {
    if (addCarModal) addCarModal.classList.remove('active');
});

document.getElementById('addCarForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.currentUser) {
        alert("Error: Debes iniciar sesión primero.");
        return;
    }

    const model = document.getElementById('newCarModel').value.trim();
    const plate = document.getElementById('newCarPlate').value.trim();
    const status = document.getElementById('newCarStatus').value;

    const newCar = {
        model,
        plate,
        status,
        pickupCity: '',
        deliveryCity: '',
        pickupDate: '',
        deliveryDate: '',
        dieselExpense: 0,
        imageURL: '',
        createdAt: new Date().toISOString()
    };

    try {
        const docRef = await addDoc(collection(db, 'users', state.currentUser.uid, 'cars'), newCar);
        newCar.id = docRef.id;
        state.cars.push(newCar);
        renderCars();

        document.getElementById('addCarForm').reset();
        if (addCarModal) addCarModal.classList.remove('active');
    } catch (err) {
        console.error("Error guardando vehículo:", err);
        alert("Error al guardar en la nube: " + err.message);
    }
});

function renderCars() {
    const container = document.getElementById('carsContainer');
    const badge = document.getElementById('carsCountBadge');

    if (!container) return;

    container.innerHTML = '';
    if (badge) badge.textContent = `${state.cars.length} Registrados`;

    if (state.cars.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; width: 100%;">
                No tienes vehículos agregados. Haz clic en el botón <strong>"+"</strong> para registrar el primero.
            </div>
        `;
        return;
    }

    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'cars-grid-container';

    state.cars.forEach((car, index) => {
        const card = document.createElement('div');
        card.className = 'car-card-item';
        card.style.cursor = 'pointer'; // Indicador de interactividad para abrir el mapa

        card.innerHTML = `
            <!-- ENCABEZADO DE TARJETA CON IMAGEN INTERACTIVA -->
            <div class="car-card-image-box">
                <span class="car-card-badge">${car.status || 'Disponible'}</span>
                
                <button class="car-card-delete-btn btn-delete-car" data-index="${index}" data-id="${car.id || ''}" title="Eliminar Vehículo">
                    <i class="fa-solid fa-trash-can"></i>
                </button>

                <label class="car-image-upload-label" title="Haz clic para subir o cambiar la imagen">
                    <input type="file" class="car-image-input" data-id="${car.id}" accept="image/*" style="display: none;">
                    ${car.imageURL 
                        ? `<img src="${car.imageURL}" class="car-card-img-preview" alt="Imagen del vehículo">` 
                        : `<i class="fa-solid fa-truck-monster" style="font-size: 4rem; color: var(--neon-blue, #00f2ff); opacity: 0.85;"></i>`
                    }
                </label>
            </div>

            <!-- CUERPO DE LA TARJETA EDITABLE -->
            <div class="car-card-body">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="car-card-title">${car.model || 'Vehículo sin Nombre'}</h3>
                    <span style="font-size: 0.75rem; color: #00f2ff; background: rgba(0, 242, 255, 0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(0,242,255,0.3);">
                        <i class="fa-solid fa-map-location-dot"></i> Ver Ruta
                    </span>
                </div>

                <!-- ETIQUETAS RÁPIDAS -->
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span class="car-tag-pill"><i class="fa-solid fa-id-card" style="color: #00f2ff;"></i> ${car.plate || 'Sin Placa'}</span>
                    <span class="car-tag-pill"><i class="fa-solid fa-gas-pump" style="color: #ff0055;"></i> Diésel: $${parseFloat(car.dieselExpense || 0).toFixed(2)}</span>
                </div>

                <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 4px 0;">

                <!-- FORMULARIO DE EDICIÓN EN LA TARJETA -->
                <div style="display: flex; flex-direction: column; gap: 0.7rem;">
                    
                    <!-- RUTA: RECOGIDA Y ENTREGA -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div class="car-card-field-group">
                            <label class="car-card-label"><i class="fa-solid fa-location-dot" style="color: #00f2ff;"></i> Recogida</label>
                            <input type="text" class="car-input-field car-auto-field" data-id="${car.id}" data-field="pickupCity" value="${car.pickupCity || ''}" placeholder="Ej. Miami, FL">
                        </div>
                        <div class="car-card-field-group">
                            <label class="car-card-label"><i class="fa-solid fa-flag-checkered" style="color: #00ff66;"></i> Entrega</label>
                            <input type="text" class="car-input-field car-auto-field" data-id="${car.id}" data-field="deliveryCity" value="${car.deliveryCity || ''}" placeholder="Ej. Atlanta, GA">
                        </div>
                    </div>

                    <!-- FECHAS: RECOGIDA Y ENTREGA -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div class="car-card-field-group">
                            <label class="car-card-label"><i class="fa-solid fa-calendar-day"></i> F. Recogida</label>
                            <input type="date" class="car-input-field car-auto-field" data-id="${car.id}" data-field="pickupDate" value="${car.pickupDate || ''}">
                        </div>
                        <div class="car-card-field-group">
                            <label class="car-card-label"><i class="fa-solid fa-calendar-check"></i> F. Entrega</label>
                            <input type="date" class="car-input-field car-auto-field" data-id="${car.id}" data-field="deliveryDate" value="${car.deliveryDate || ''}">
                        </div>
                    </div>

                    <!-- PLACA Y GASTO DE DIÉSEL -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div class="car-card-field-group">
                            <label class="car-card-label"><i class="fa-solid fa-barcode"></i> Placa / VIN</label>
                            <input type="text" class="car-input-field car-auto-field" data-id="${car.id}" data-field="plate" value="${car.plate || ''}" placeholder="Placa">
                        </div>
                        <div class="car-card-field-group">
                            <label class="car-card-label"><i class="fa-solid fa-gas-pump" style="color: #ff0055;"></i> Diésel ($)</label>
                            <input type="number" step="0.01" class="car-input-field car-auto-field" data-id="${car.id}" data-field="dieselExpense" value="${car.dieselExpense || ''}" placeholder="0.00">
                        </div>
                    </div>

                    <!-- ESTADO -->
                    <div class="car-card-field-group">
                        <label class="car-card-label"><i class="fa-solid fa-signal"></i> Estado del Vehículo</label>
                        <select class="car-input-field car-auto-field" data-id="${car.id}" data-field="status">
                            <option value="Disponible" ${car.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
                            <option value="En Ruta" ${car.status === 'En Ruta' ? 'selected' : ''}>En Ruta</option>
                            <option value="Mantenimiento" ${car.status === 'Mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                        </select>
                    </div>

                    <div id="car-save-status-${car.id}" style="font-size: 0.72rem; color: #00ff66; font-weight: bold; text-align: right; opacity: 0; transition: opacity 0.3s ease; height: 16px;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Cambios guardados
                    </div>

                </div>
            </div>
        `;

        // Evento para abrir el mapa al tocar/hacer clic en la tarjeta
        card.addEventListener('click', (e) => {
            if (e.target.closest('input') || e.target.closest('select') || e.target.closest('button') || e.target.closest('label')) {
                return;
            }
            openRouteMap(car.pickupCity, car.deliveryCity, car.model || 'Vehículo');
        });

        gridWrapper.appendChild(card);
    });

    container.appendChild(gridWrapper);

    // Eventos de eliminación
    document.querySelectorAll('.btn-delete-car').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const index = parseInt(btn.getAttribute('data-index'));
            const docId = btn.getAttribute('data-id');
            const targetCar = state.cars[index];

            if (!targetCar) return;
            if (!confirm(`¿Estás seguro de eliminar el vehículo "${targetCar.model || 'seleccionado'}"?`)) return;

            try {
                if (docId && state.currentUser) {
                    await deleteDoc(doc(db, 'users', state.currentUser.uid, 'cars', docId));
                }
                state.cars.splice(index, 1);
                renderCars();
            } catch (err) {
                console.error("Error eliminando vehículo:", err);
            }
        });
    });

    setupCarAutoSaveEvents();
    setupCarImageUploadEvents();
}

function setupCarImageUploadEvents() {
    document.querySelectorAll('.car-image-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const carId = input.getAttribute('data-id');

            if (!file) return;

            if (file.size > 1 * 1024 * 1024) {
                alert("La imagen es demasiado grande. Elige una foto menor a 1 MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;

                const carIndex = state.cars.findIndex(c => c.id === carId);
                if (carIndex !== -1) {
                    state.cars[carIndex].imageURL = base64Image;
                }

                try {
                    if (state.currentUser && carId) {
                        const carDocRef = doc(db, 'users', state.currentUser.uid, 'cars', carId);
                        await setDoc(carDocRef, { imageURL: base64Image }, { merge: true });
                        showCarSaveStatus(carId);
                    }
                } catch (err) {
                    console.error("Error al guardar la imagen en Firestore:", err);
                    alert("No se pudo guardar la imagen: " + err.message);
                }

                renderCars();
            };

            reader.readAsDataURL(file);
        });
    });
}

function setupCarAutoSaveEvents() {
    document.querySelectorAll('.car-auto-field').forEach(field => {
        const handler = (e) => {
            const id = field.getAttribute('data-id');
            const key = field.getAttribute('data-field');
            let val = field.value;

            if (key === 'dieselExpense') {
                val = parseFloat(val) || 0;
            }

            const carIndex = state.cars.findIndex(c => c.id === id);
            if (carIndex === -1) return;

            state.cars[carIndex][key] = val;

            if (carAutoSaveTimers[id]) {
                clearTimeout(carAutoSaveTimers[id]);
            }

            carAutoSaveTimers[id] = setTimeout(async () => {
                try {
                    if (state.currentUser) {
                        const carDocRef = doc(db, 'users', state.currentUser.uid, 'cars', id);
                        await setDoc(carDocRef, { [key]: val }, { merge: true });
                        showCarSaveStatus(id);
                    }
                } catch (err) {
                    console.error("Error al actualizar vehículo en Firestore:", err);
                }
            }, 500);
        };

        field.addEventListener('input', handler);
        field.addEventListener('change', handler);
    });
}

function showCarSaveStatus(id) {
    const statusEl = document.getElementById(`car-save-status-${id}`);
    if (statusEl) {
        statusEl.style.opacity = '1';
        setTimeout(() => {
            statusEl.style.opacity = '0';
        }, 2000);
    }
}

// ==========================================
// CÁLCULO Y GUARDADO DE INVOICES
// ==========================================
document.getElementById('calculateInvoiceBtn')?.addEventListener('click', () => {
    const code = document.getElementById('invCodeInput').value.trim();
    const loadAmount = parseFloat(document.getElementById('invLoadAmount').value);
    const incentive = parseFloat(document.getElementById('invIncentive').value) || 0;
    const deduction = parseFloat(document.getElementById('invDeduction').value) || 0;
    
    const incentiveReason = document.getElementById('invIncentiveReason').value.trim() || 'Sin motivo especificado';
    const deductionReason = document.getElementById('invDeductionReason').value.trim() || 'Sin observaciones';

    if (!code || isNaN(loadAmount) || loadAmount <= 0) {
        alert('Por favor ingresa un código válido y un monto bruto de carga.');
        return;
    }

    const worker = state.personnel.find(p => p.code === code);
    if (!worker) {
        alert('Código no encontrado en tu equipo de trabajo.');
        return;
    }

    const baseWorkerPay = loadAmount * (worker.percent / 100);
    const finalWorkerPay = baseWorkerPay + incentive - deduction;
    const finalOwnerPay = loadAmount - finalWorkerPay;

    state.lastInvoiceCalc = {
        code: worker.code,
        workerName: worker.name,
        workerPercent: worker.percent,
        loadAmount,
        baseWorkerPay,
        incentive,
        incentiveReason,
        deduction,
        deductionReason,
        finalWorkerPay,
        finalOwnerPay,
        createdAt: new Date().toISOString()
    };

    const ownerDisplayName = state.userProfile?.fullName || state.currentUser?.displayName || 'Propietario';

    document.getElementById('invOutOwner').textContent = ownerDisplayName;
    document.getElementById('invOutCode').textContent = `COD: ${worker.code}`;
    document.getElementById('invOutWorkerName').textContent = worker.name;
    document.getElementById('invOutGross').textContent = `$${loadAmount.toFixed(2)}`;
    document.getElementById('invOutWorkerPercent').textContent = `${worker.percent}%`;
    document.getElementById('invOutBasePay').textContent = `$${baseWorkerPay.toFixed(2)}`;

    document.getElementById('invOutIncentive').textContent = `+$${incentive.toFixed(2)}`;
    document.getElementById('invOutIncentiveReason').textContent = incentiveReason;

    document.getElementById('invOutDeduction').textContent = `-$${deduction.toFixed(2)}`;
    document.getElementById('invOutDeductionReason').textContent = deductionReason;

    document.getElementById('invOutWorkerPay').textContent = `$${finalWorkerPay.toFixed(2)}`;
    document.getElementById('invOutOwnerPay').textContent = `$${finalOwnerPay.toFixed(2)}`;

    document.getElementById('invoiceResultContainer').style.display = 'block';
});

document.getElementById('saveInvoiceToSystemBtn')?.addEventListener('click', async () => {
    if (!state.currentUser || !state.lastInvoiceCalc) {
        alert('No hay ninguna factura calculada para guardar.');
        return;
    }

    try {
        const docRef = await addDoc(collection(db, 'users', state.currentUser.uid, 'invoices'), state.lastInvoiceCalc);
        state.invoices.push({ id: docRef.id, ...state.lastInvoiceCalc });
        alert('¡Factura guardada exitosamente en la nube!');
        document.getElementById('invoiceForm')?.reset();
        document.getElementById('invoiceResultContainer').style.display = 'none';
        state.lastInvoiceCalc = null;
        
        renderInvoices();
    } catch (err) {
        alert('Error al guardar la factura: ' + err.message);
    }
});

document.getElementById('invoiceSearchCodeInput')?.addEventListener('input', (e) => {
    invoiceSearchQuery = e.target.value.trim();
    renderInvoices();
});

function renderInvoices() {
    const container = document.getElementById('invoicesAccordionContainer');
    if (!container) return;

    container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
    `;

    container.innerHTML = '';

    if (!state.invoices || state.invoices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; width: 100%;">
                No tienes facturas guardadas en tu cuenta.
            </div>
        `;
        return;
    }

    let sortedInvoices = [...state.invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (invoiceSearchQuery !== '') {
        sortedInvoices = sortedInvoices.filter(inv => inv.code && inv.code.includes(invoiceSearchQuery));
    }

    if (sortedInvoices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem; border: 1px dashed rgba(255,0,85,0.3); border-radius: 12px; width: 100%;">
                No se encontraron invoices asociados al código: <strong style="color: var(--neon-red);">${invoiceSearchQuery}</strong>
            </div>
        `;
        return;
    }

    sortedInvoices.forEach(inv => {
        const isNegative = inv.finalOwnerPay < 0;
        const ownerPayColor = isNegative ? '#ff0055' : '#00ff66';
        const ownerPayGlow = isNegative ? 'rgba(255,0,85,0.4)' : 'rgba(0,255,102,0.3)';
        const ownerPaySign = isNegative ? '' : '+';

        const card = document.createElement('div');
        card.className = 'invoice-item-card sync-scroll-card';
        card.style.cssText = `
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid ${isNegative ? '#ff0055' : 'var(--neon-blue)'};
            border-radius: 12px;
            padding: 1.2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            width: 100%;
            white-space: nowrap;
        `;

        card.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 2rem; min-width: max-content;">
                
                <!-- 1. TRABAJADOR Y CÓDIGO -->
                <div style="display: flex; flex-direction: column; min-width: 160px;">
                    <strong style="color: var(--neon-blue); font-size: 1.1rem; font-family: 'Rajdhani', sans-serif;">
                        <i class="fa-solid fa-user-check"></i> ${inv.workerName}
                    </strong>
                    <span class="code-badge" style="margin-top: 4px; width: fit-content;">COD: ${inv.code}</span>
                    <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); margin-top: 4px;">
                        <i class="fa-regular fa-clock"></i> ${new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <!-- 2. MI GANANCIA (PROPIETARIO) -->
                <div style="text-align: center; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 1.5rem; min-width: 140px;">
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; display: block;">Mi Ganancia</span>
                    <span style="color: ${ownerPayColor}; font-weight: 900; font-family: 'Orbitron', monospace; font-size: 1.2rem; text-shadow: 0 0 10px ${ownerPayGlow};">
                        ${ownerPaySign}$${inv.finalOwnerPay.toFixed(2)}
                    </span>
                </div>

                <!-- 3. DESGLOSE DE VALORES FINANCIEROS -->
                <div style="display: flex; gap: 1.2rem; background: rgba(0,0,0,0.3); padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.85rem; border-left: 1px solid rgba(255,255,255,0.1);">
                    <div><span style="color: var(--text-muted); display:block; font-size:0.7rem;">Carga:</span> <strong style="color: #fff;">$${inv.loadAmount.toFixed(2)}</strong></div>
                    <div><span style="color: var(--text-muted); display:block; font-size:0.7rem;">Base (${inv.workerPercent}%):</span> <strong style="color: #fff;">$${inv.baseWorkerPay.toFixed(2)}</strong></div>
                    <div><span style="color: var(--text-muted); display:block; font-size:0.7rem;">Bono:</span> <strong style="color: #00ff66;">+$${inv.incentive.toFixed(2)}</strong></div>
                    <div><span style="color: var(--text-muted); display:block; font-size:0.7rem;">Descuento:</span> <strong style="color: #ff0055;">-$${inv.deduction.toFixed(2)}</strong></div>
                    <div><span style="color: var(--text-muted); display:block; font-size:0.7rem;">Pago Chofer:</span> <strong style="color: #00f2ff;">$${inv.finalWorkerPay.toFixed(2)}</strong></div>
                </div>

                <!-- 4. CAMPOS DE DETALLES Y FORMULARIO CON AUTOGUARDADO -->
                <div style="display: flex; gap: 1rem; align-items: center; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 1.5rem;">
                    <div>
                        <label class="form-label" style="font-size: 0.7rem; margin-bottom: 2px;"><i class="fa-solid fa-location-dot" style="color: var(--neon-blue);"></i> Ciu. Recogida</label>
                        <input type="text" class="form-control inv-auto-field inv-pickup-city-input" data-id="${inv.id}" data-field="pickupCity" value="${inv.pickupCity || ''}" placeholder="Ej. Miami, FL" style="width: 120px; padding: 4px 8px; font-size: 0.8rem;">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: 0.7rem; margin-bottom: 2px;"><i class="fa-solid fa-flag-checkered" style="color: #00ff66;"></i> Ciu. Entrega</label>
                        <input type="text" class="form-control inv-auto-field inv-delivery-city-input" data-id="${inv.id}" data-field="deliveryCity" value="${inv.deliveryCity || ''}" placeholder="Ej. Atlanta, GA" style="width: 120px; padding: 4px 8px; font-size: 0.8rem;">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: 0.7rem; margin-bottom: 2px;"><i class="fa-solid fa-calendar-day"></i> Recogida</label>
                        <input type="date" class="form-control inv-auto-field inv-pickup-input" data-id="${inv.id}" data-field="pickupDate" value="${inv.pickupDate || ''}" style="width: 130px; padding: 4px 8px; font-size: 0.8rem;">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: 0.7rem; margin-bottom: 2px;"><i class="fa-solid fa-calendar-check"></i> Entrega</label>
                        <input type="date" class="form-control inv-auto-field inv-delivery-input" data-id="${inv.id}" data-field="deliveryDate" value="${inv.deliveryDate || ''}" style="width: 130px; padding: 4px 8px; font-size: 0.8rem;">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: 0.7rem; margin-bottom: 2px;"><i class="fa-solid fa-gas-pump"></i> Diésel ($)</label>
                        <input type="number" step="0.01" class="form-control inv-auto-field inv-fuel-input" data-id="${inv.id}" data-field="fuelExpense" value="${inv.fuelExpense || ''}" placeholder="Ej. 350.00" style="width: 100px; padding: 4px 8px; font-size: 0.8rem;">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: 0.7rem; margin-bottom: 2px;"><i class="fa-solid fa-truck-ramp-box"></i> Tipo</label>
                        <select class="form-control inv-auto-field inv-type-select" data-id="${inv.id}" data-field="loadType" style="width: 110px; padding: 4px 8px; font-size: 0.8rem;">
                            <option value="Dedicada" ${inv.loadType === 'Dedicada' ? 'selected' : ''}>Dedicada</option>
                            <option value="Parcial" ${inv.loadType === 'Parcial' ? 'selected' : ''}>Parcial</option>
                        </select>
                    </div>
                    
                    <div id="save-status-${inv.id}" style="font-size: 0.75rem; color: #00ff66; font-weight: bold; min-width: 90px; opacity: 0; transition: opacity 0.3s ease; margin-left: 10px;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Guardado
                    </div>
                </div>

            </div>
        `;
        container.appendChild(card);
    });

    setupInvoiceDetailEvents();
    setupSyncedScroll();
}

function setupSyncedScroll() {
    const cards = document.querySelectorAll('.sync-scroll-card');
    if (cards.length === 0) return;

    let activeCard = null;

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => { activeCard = card; });
        card.addEventListener('touchstart', () => { activeCard = card; });

        card.addEventListener('scroll', () => {
            if (activeCard !== card) return;

            const currentScrollLeft = card.scrollLeft;

            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.scrollLeft = currentScrollLeft;
                }
            });
        });

        card.addEventListener('wheel', (evt) => {
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                card.scrollLeft += evt.deltaY;
            }
        }, { passive: false });
    });
}

function showAutoSaveStatus(id) {
    const statusEl = document.getElementById(`save-status-${id}`);
    if (statusEl) {
        statusEl.style.opacity = '1';
        setTimeout(() => {
            statusEl.style.opacity = '0';
        }, 2000);
    }
}

// ==========================================
// AUTOGUARDADO DE CAMPOS DE INVOICE EN FIRESTORE
// ==========================================
function setupInvoiceDetailEvents() {
    document.querySelectorAll('.inv-auto-field').forEach(field => {
        const handler = (e) => {
            const id = field.getAttribute('data-id');
            const key = field.getAttribute('data-field');
            let val = field.value;

            if (key === 'fuelExpense') {
                val = parseFloat(val) || 0;
            }

            const invIndex = state.invoices.findIndex(i => i.id === id);
            if (invIndex === -1) return;

            state.invoices[invIndex][key] = val;

            if (autoSaveDebounceTimers[id]) {
                clearTimeout(autoSaveDebounceTimers[id]);
            }

            autoSaveDebounceTimers[id] = setTimeout(async () => {
                try {
                    if (state.currentUser) {
                        const invDocRef = doc(db, 'users', state.currentUser.uid, 'invoices', id);
                        await setDoc(invDocRef, { [key]: val }, { merge: true });
                        showAutoSaveStatus(id);
                    }
                } catch (err) {
                    console.error("Error al guardar campo en Firestore:", err);
                }
            }, 500);
        };

        field.addEventListener('input', handler);
        field.addEventListener('change', handler);
    });
}

function setupTogglePassword(btnId, inputId) {
    document.getElementById(btnId)?.addEventListener('click', () => {
        const field = document.getElementById(inputId);
        if (field) field.type = field.type === 'password' ? 'text' : 'password';
    });
}
setupTogglePassword('toggleLoginPassword', 'loginPassword');
setupTogglePassword('toggleRegPassword', 'regPassword');

// ==========================================
// LÓGICA Y FUNCIONALIDAD DE CALCULADORA FLOTANTE
// ==========================================
const floatingCalc = document.getElementById('floatingCalc');
const calcHeader = document.getElementById('calcHeader');
const calcBody = document.getElementById('calcBody');
const calcDisplay = document.getElementById('calcDisplay');
const linkFloatingCalc = document.getElementById('linkFloatingCalc');
const closeCalcBtn = document.getElementById('closeCalcBtn');
const minimizeCalcBtn = document.getElementById('minimizeCalcBtn');

// 1. Mostrar Calculadora desde el Menú
linkFloatingCalc?.addEventListener('click', (e) => {
    e.preventDefault();
    floatingCalc.classList.add('active');
    if (typeof toggleDrawer === 'function' && document.getElementById('sideDrawer')?.classList.contains('open')) {
        toggleDrawer();
    }
});

// 2. Cerrar y Minimizar
closeCalcBtn?.addEventListener('click', () => {
    floatingCalc.classList.remove('active');
});

minimizeCalcBtn?.addEventListener('click', () => {
    calcBody.classList.toggle('minimized');
});

// 3. Ventana Arrastrable (Drag and Drop)
let isDragging = false;
let offsetX = 0, offsetY = 0;

calcHeader?.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - floatingCalc.offsetLeft;
    offsetY = e.clientY - floatingCalc.offsetTop;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    floatingCalc.style.left = `${e.clientX - offsetX}px`;
    floatingCalc.style.top = `${e.clientY - offsetY}px`;
    floatingCalc.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Soporte táctil para pantallas móviles
calcHeader?.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - floatingCalc.offsetLeft;
    offsetY = touch.clientY - floatingCalc.offsetTop;
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    floatingCalc.style.left = `${touch.clientX - offsetX}px`;
    floatingCalc.style.top = `${touch.clientY - offsetY}px`;
    floatingCalc.style.right = 'auto';
});

document.addEventListener('touchend', () => {
    isDragging = false;
});

// 4. Lógica de Operaciones de la Calculadora
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        const action = btn.getAttribute('data-action');

        if (val !== null) {
            if (calcDisplay.value === '0' || calcDisplay.value === 'Error') {
                calcDisplay.value = val;
            } else {
                calcDisplay.value += val;
            }
        } else if (action === 'clear') {
            calcDisplay.value = '0';
        } else if (action === 'backspace') {
            calcDisplay.value = calcDisplay.value.slice(0, -1) || '0';
        } else if (action === 'calculate') {
            try {
                calcDisplay.value = Function(`'use strict'; return (${calcDisplay.value})`)();
            } catch (err) {
                calcDisplay.value = 'Error';
            }
        }
    });
});
