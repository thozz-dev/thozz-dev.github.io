const translations = {
    fr: {
        common: {
            loading: "Chargement",
            error: "Erreur",
            success: "Succès",
            save: "Enregistrer",
            cancel: "Annuler",
            delete: "Supprimer",
            edit: "Modifier",
            add: "Ajouter",
            search: "Rechercher",
            filter: "Filtrer",
            all: "Tout",
            none: "Aucun",
            yes: "Oui",
            no: "Non",
            confirm: "Confirmer",
            close: "Fermer"
        },
        gallery: {
            title: "Galerie",
            addImage: "Ajouter une image",
            editImage: "Modifier l'image",
            deleteImage: "Supprimer l'image",
            imageTitle: "Titre de l'image",
            imageDescription: "Description",
            imageCategory: "Catégorie",
            imageTags: "Tags",
            imageLocation: "Localisation",
            uploadThumbnail: "Miniature",
            uploadFullImage: "Image complète",
            dragAndDrop: "Glissez-déposez vos images ici",
            or: "ou",
            clickToUpload: "Cliquez pour télécharger",
            categories: {
                nature: "Nature",
                portrait: "Portrait",
                urban: "Urbain",
                abstract: "Abstrait"
            }
        },
        settings: {
            title: "Paramètres",
            language: "Langue",
            theme: "Thème",
            galleryView: "Vue de la galerie",
            sync: "Synchronisation",
            export: "Exporter",
            import: "Importer",
            backup: "Sauvegarde",
            restore: "Restaurer"
        },
        map: {
            title: "Carte",
            search: "Rechercher un lieu",
            radius: "Rayon de recherche",
            km: "km",
            noLocation: "Aucune localisation",
            addLocation: "Ajouter une localisation"
        },
        exif: {
            title: "Informations techniques",
            camera: "Appareil photo",
            lens: "Objectif",
            focalLength: "Focale",
            aperture: "Ouverture",
            shutterSpeed: "Vitesse d'obturation",
            iso: "ISO",
            date: "Date de prise de vue"
        }
    },
    en: {
        common: {
            loading: "Loading",
            error: "Error",
            success: "Success",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            edit: "Edit",
            add: "Add",
            search: "Search",
            filter: "Filter",
            all: "All",
            none: "None",
            yes: "Yes",
            no: "No",
            confirm: "Confirm",
            close: "Close"
        },
        gallery: {
            title: "Gallery",
            addImage: "Add image",
            editImage: "Edit image",
            deleteImage: "Delete image",
            imageTitle: "Image title",
            imageDescription: "Description",
            imageCategory: "Category",
            imageTags: "Tags",
            imageLocation: "Location",
            uploadThumbnail: "Thumbnail",
            uploadFullImage: "Full image",
            dragAndDrop: "Drag and drop your images here",
            or: "or",
            clickToUpload: "Click to upload",
            categories: {
                nature: "Nature",
                portrait: "Portrait",
                urban: "Urban",
                abstract: "Abstract"
            }
        },
        settings: {
            title: "Settings",
            language: "Language",
            theme: "Theme",
            galleryView: "Gallery view",
            sync: "Sync",
            export: "Export",
            import: "Import",
            backup: "Backup",
            restore: "Restore"
        },
        map: {
            title: "Map",
            search: "Search location",
            radius: "Search radius",
            km: "km",
            noLocation: "No location",
            addLocation: "Add location"
        },
        exif: {
            title: "Technical information",
            camera: "Camera",
            lens: "Lens",
            focalLength: "Focal length",
            aperture: "Aperture",
            shutterSpeed: "Shutter speed",
            iso: "ISO",
            date: "Date taken"
        }
    }
};

class I18nService {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'fr';
        this.translations = translations;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            document.documentElement.lang = lang;
            this.updatePageContent();
        }
    }

    getLanguage() {
        return this.currentLang;
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        return value;
    }

    updatePageContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

export const i18n = new I18nService(); 