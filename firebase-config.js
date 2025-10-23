/**
 * Configuración pública de Firebase
 *
 * INSTRUCCIONES:
 * 1. Ve a Firebase Console → Tu proyecto → Project Settings
 * 2. En "Your apps" → Web app → SDK setup and configuration
 * 3. Copia los valores y pégalos aquí
 * 4. Guarda este archivo y haz commit a GitHub
 * 5. Todos los visitantes verán los mismos proyectos automáticamente
 *
 * NOTA: Es seguro exponer estos valores públicamente.
 * Firebase los usa solo para conectarse, la seguridad está en las reglas.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAfcxwY_ovjXUqqhKwBaSuUDHk8Gji3ClU",
  authDomain: "jenabo-portafolio.firebaseapp.com",
  projectId: "jenabo-portafolio",
  storageBucket: "jenabo-portafolio.firebasestorage.app",
  messagingSenderId: "653786905905",
  appId: "1:653786905905:web:d0892526c97438b14b8410",
  measurementId: "G-JG6JPV55LM"
};

// No modifiques nada debajo de esta línea
window.JENABO_FIREBASE_CONFIG = FIREBASE_CONFIG;

// Debug temporal - muestra un indicador visual
if (FIREBASE_CONFIG.apiKey !== "TU_API_KEY_AQUI") {
  console.log("✅ Firebase config cargado:", FIREBASE_CONFIG.projectId);

  // Crear indicador visual temporal (5 segundos)
  setTimeout(() => {
    const indicator = document.createElement('div');
    indicator.style.cssText = 'position:fixed;top:10px;right:10px;background:#4caf50;color:white;padding:10px 20px;border-radius:5px;z-index:99999;font-family:sans-serif;';
    indicator.textContent = '✅ Firebase: ' + FIREBASE_CONFIG.projectId;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 5000);
  }, 1000);
}
