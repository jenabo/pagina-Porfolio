# Configuración Firebase - Una sola vez ✅

## Configuración rápida (5 minutos)

### Paso 1: Crear proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en **"Agregar proyecto"**
3. Nombre: `jenabo-portfolio`
4. Desactiva Google Analytics
5. Clic en **"Crear proyecto"**

### Paso 2: Configurar Firestore

1. Menú lateral → **"Build"** → **"Firestore Database"**
2. Clic en **"Create database"**
3. Ubicación: `us-central` o la más cercana
4. Modo: **"Production mode"**
5. Clic en **"Create"**

### Paso 3: Configurar reglas de Firestore

1. Ve a pestaña **"Rules"**
2. Pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Clic en **"Publish"**

### Paso 4: Registrar tu app web

1. En la página principal, clic en el ícono **"</>"** (Web)
2. Nombre: `Jenabo Portfolio`
3. NO marques Firebase Hosting
4. Clic en **"Register app"**
5. **COPIA** la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "jenabo-portfolio.firebaseapp.com",
  projectId: "jenabo-portfolio",
  storageBucket: "jenabo-portfolio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Paso 5: Pegar configuración en tu código

1. Abre el archivo **`firebase-config.js`** (en la raíz del proyecto)
2. Reemplaza los valores con los que copiaste:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",  // ← Pega tu apiKey
  authDomain: "jenabo-portfolio.firebaseapp.com",  // ← Pega tu authDomain
  projectId: "jenabo-portfolio",  // ← Pega tu projectId
  storageBucket: "jenabo-portfolio.appspot.com",  // ← Pega tu storageBucket
  messagingSenderId: "123456789",  // ← Pega tu messagingSenderId
  appId: "1:123456789:web:abc123"  // ← Pega tu appId
};
```

3. **Guarda el archivo**
4. **Haz commit y push a GitHub**

```bash
git add firebase-config.js
git commit -m "Configurar Firebase"
git push
```

### Paso 6: Listo ✅

**¡Ya está!** Ahora:

- ✅ Todos los visitantes ven los proyectos de Firebase automáticamente
- ✅ No necesitas configurar nada más
- ✅ Cuando creas/editas/eliminas desde el panel admin, todos lo ven instantáneamente

## Cómo usar el panel admin

1. En tu sitio, presiona **Shift + O**
2. Ingresa el PIN: `1234`
3. Crea proyectos normalmente
4. **Todos verán los cambios al instante**

## ¿Es seguro exponer firebase-config.js?

**SÍ**, es completamente seguro. Estos valores son públicos por diseño:
- Firebase los usa solo para conectarse
- La seguridad real está en las **reglas de Firestore**
- Google, Facebook, Twitter exponen estos valores en sus sitios

## Notas importantes

- **Sin tarjeta**: No necesitas tarjeta de crédito
- **Imágenes**: Máximo 1-3 MB, comprimidas
- **Límites gratuitos**: 50,000 lecturas/día (más que suficiente)

## Cambiar PIN de admin

Edita `assets/js/app.js`:

```javascript
const ADMIN_PIN = "1234";  // ← Cambia esto por tu PIN
```

## ¿Problemas?

1. Verifica que las reglas de Firestore estén publicadas
2. Espera 10-20 segundos después de cambiar las reglas
3. Recarga la página con Ctrl + F5
4. Abre la consola del navegador (F12) para ver errores

---

¡Listo para usar! 🚀
