/**
 * Firebase Integration for Jenabo Portfolio
 * Gestiona proyectos e imágenes usando Firestore y Storage
 */

class FirebaseManager {
  constructor() {
    this.db = null;
    this.storage = null;
    this.app = null;
    this.isConfigured = false;
    this.projectsCollection = 'jenabo_projects';

    // Cargar configuración guardada
    this.loadConfig();
  }

  /**
   * Guarda la configuración en localStorage
   */
  saveConfig(config) {
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
  }

  /**
   * Carga la configuración desde localStorage
   */
  loadConfig() {
    const saved = localStorage.getItem('firebaseConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.initialize(config);
      } catch (error) {
        console.error('Error al cargar configuración de Firebase:', error);
      }
    }
  }

  /**
   * Limpia la configuración
   */
  clearConfig() {
    localStorage.removeItem('firebaseConfig');
    this.isConfigured = false;
    this.db = null;
    this.storage = null;
    this.app = null;
  }

  /**
   * Inicializa Firebase con la configuración proporcionada
   */
  async initialize(config) {
    try {
      // Verificar que Firebase SDK esté cargado
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK no está cargado');
      }

      // Si ya hay una app inicializada, la eliminamos
      if (this.app) {
        await firebase.app().delete();
      }

      // Inicializar Firebase (solo Firestore, sin Storage)
      this.app = firebase.initializeApp(config);
      this.db = firebase.firestore();
      this.storage = null; // No usamos Storage para evitar requerir tarjeta
      this.isConfigured = true;

      // Guardar configuración
      this.saveConfig(config);

      return true;
    } catch (error) {
      console.error('Error al inicializar Firebase:', error);
      this.isConfigured = false;
      throw error;
    }
  }

  /**
   * Verifica si Firebase está configurado y listo
   */
  checkConfigured() {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firebase no está configurado');
    }
  }

  /**
   * Obtiene todos los proyectos desde Firestore
   */
  async getProjects() {
    this.checkConfigured();

    try {
      const snapshot = await this.db.collection(this.projectsCollection)
        .orderBy('date', 'desc')
        .get();

      const projects = [];
      snapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return projects;
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      throw error;
    }
  }

  /**
   * Agrega un nuevo proyecto a Firestore
   */
  async addProject(project) {
    this.checkConfigured();

    try {
      const docRef = await this.db.collection(this.projectsCollection).add({
        ...project,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al agregar proyecto:', error);
      throw error;
    }
  }

  /**
   * Actualiza un proyecto existente
   */
  async updateProject(id, project) {
    this.checkConfigured();

    try {
      await this.db.collection(this.projectsCollection).doc(id).update({
        ...project,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      throw error;
    }
  }

  /**
   * Elimina un proyecto
   */
  async deleteProject(id) {
    this.checkConfigured();

    try {
      // Eliminar el documento directamente
      // Las imágenes están guardadas como base64 dentro del documento
      await this.db.collection(this.projectsCollection).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      throw error;
    }
  }

  /**
   * Actualiza la fecha de un proyecto (para marcar como nuevo)
   */
  async updateProjectDate(id) {
    this.checkConfigured();

    try {
      await this.db.collection(this.projectsCollection).doc(id).update({
        date: new Date().toISOString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar fecha:', error);
      throw error;
    }
  }

  /**
   * Prueba la conexión con Firebase
   */
  async testConnection() {
    this.checkConfigured();

    try {
      // Intentar leer la colección
      await this.db.collection(this.projectsCollection).limit(1).get();
      return true;
    } catch (error) {
      console.error('Error al probar conexión:', error);
      throw error;
    }
  }
}

// Exportar para uso global
window.FirebaseManager = FirebaseManager;
