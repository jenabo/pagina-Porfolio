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

// Log silencioso (solo en consola para debug si es necesario)
if (FIREBASE_CONFIG.apiKey !== "TU_API_KEY_AQUI") {
  console.log("✅ Firebase conectado:", FIREBASE_CONFIG.projectId);
}
