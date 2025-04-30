class GalleryService {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/thozz-dev.github.io/gallery.json';
        this.localBackup = 'gallery-backup.json';
        this.offlineMode = false;
    }

    async init() {
        try {
            await this.checkConnectivity();
        } catch (error) {
            console.warn('Mode hors ligne activé:', error);
            this.offlineMode = true;
        }
    }

    async checkConnectivity() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('API non disponible');
            return true;
        } catch (error) {
            this.offlineMode = true;
            return false;
        }
    }

    async getGallery() {
        if (this.offlineMode) {
            return this.getLocalGallery();
        }

        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('Erreur lors du chargement de la galerie');
            const data = await response.json();
            this.saveLocalBackup(data);
            return data;
        } catch (error) {
            console.error('Erreur de chargement:', error);
            return this.getLocalGallery();
        }
    }

    async saveGallery(galleryData) {
        if (this.offlineMode) {
            return this.saveLocalGallery(galleryData);
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${this.getGitHubToken()}`
                },
                body: JSON.stringify(galleryData)
            });

            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
            
            this.saveLocalBackup(galleryData);
            return true;
        } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            return this.saveLocalGallery(galleryData);
        }
    }

    async addImage(imageData) {
        const gallery = await this.getGallery();
        imageData.id = Date.now();
        imageData.createdAt = new Date().toISOString();
        imageData.modifiedAt = imageData.createdAt;
        
        gallery.items.push(imageData);
        return this.saveGallery(gallery);
    }

    async updateImage(imageId, imageData) {
        const gallery = await this.getGallery();
        const index = gallery.items.findIndex(item => item.id === imageId);
        
        if (index === -1) throw new Error('Image non trouvée');
        
        imageData.modifiedAt = new Date().toISOString();
        gallery.items[index] = { ...gallery.items[index], ...imageData };
        
        return this.saveGallery(gallery);
    }

    async deleteImage(imageId) {
        const gallery = await this.getGallery();
        gallery.items = gallery.items.filter(item => item.id !== imageId);
        return this.saveGallery(gallery);
    }

    async updateSettings(settings) {
        const gallery = await this.getGallery();
        gallery.settings = { ...gallery.settings, ...settings };
        return this.saveGallery(gallery);
    }

    // Méthodes de gestion locale
    getLocalGallery() {
        const localData = localStorage.getItem('galleryData');
        return localData ? JSON.parse(localData) : { items: [], settings: {} };
    }

    saveLocalGallery(galleryData) {
        localStorage.setItem('galleryData', JSON.stringify(galleryData));
        this.saveLocalBackup(galleryData);
        return true;
    }

    saveLocalBackup(galleryData) {
        const blob = new Blob([JSON.stringify(galleryData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.localBackup;
        link.click();
        URL.revokeObjectURL(url);
    }

    getGitHubToken() {
        return localStorage.getItem('githubToken');
    }

    setGitHubToken(token) {
        localStorage.setItem('githubToken', token);
    }

    // Méthodes de synchronisation
    async syncGallery() {
        if (this.offlineMode) {
            throw new Error('Mode hors ligne - synchronisation impossible');
        }

        const localData = this.getLocalGallery();
        const remoteData = await this.getGallery();

        if (this.hasConflicts(localData, remoteData)) {
            throw new Error('Conflits détectés - résolution manuelle nécessaire');
        }

        return this.saveGallery(remoteData);
    }

    hasConflicts(localData, remoteData) {
        // Logique de détection de conflits
        return false; // À implémenter selon vos besoins
    }

    // Méthodes d'export/import
    exportGallery() {
        const galleryData = this.getLocalGallery();
        const blob = new Blob([JSON.stringify(galleryData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'gallery-export.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    async importGallery(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const galleryData = JSON.parse(e.target.result);
                    await this.saveGallery(galleryData);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }
}

export const galleryService = new GalleryService();

import { uploadService } from './upload-service.js';

uploadService.initDropZone('dropZone', (result) => {
    console.log('Image uploadée:', result);
}); 