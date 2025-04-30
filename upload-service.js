class UploadService {
    constructor() {
        this.dropZones = new Map();
        this.uploadCallbacks = new Map();
        this.maxFileSize = 5 * 1024 * 1024;
        this.allowedTypes = ['image/jpeg', 'image/png'];
    }

    initDropZone(elementId, onUpload) {
        const element = document.getElementById(elementId);
        if (!element) return;

        this.dropZones.set(elementId, element);
        this.uploadCallbacks.set(elementId, onUpload);

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files, elementId);
        });

        // Ajouter la gestion du clic pour ouvrir le sélecteur de fichiers
        element.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = this.allowedTypes.join(',');
            input.multiple = false;
            input.style.display = 'none';
            document.body.appendChild(input);

            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFiles(files, elementId);
                document.body.removeChild(input);
            });

            input.click();
        });
    }

    async handleFiles(files, elementId) {
        const callback = this.uploadCallbacks.get(elementId);
        if (!callback) return;

        for (const file of files) {
            if (!this.validateFile(file)) {
                this.showError(`Le fichier ${file.name} n'est pas valide`);
                continue;
            }

            try {
                const result = await this.processFile(file);
                callback(result);
            } catch (error) {
                this.showError(`Erreur lors du traitement de ${file.name}: ${error.message}`);
            }
        }
    }

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            this.showError(`Type de fichier non supporté: ${file.type}`);
            return false;
        }

        if (file.size > this.maxFileSize) {
            this.showError(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return false;
        }

        return true;
    }

    async processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const result = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result,
                        preview: URL.createObjectURL(file)
                    };

                    // Extraire les métadonnées EXIF si c'est une image
                    if (file.type.startsWith('image/')) {
                        const exifData = await exifService.extractExifData(file);
                        result.exif = exifService.formatExifData(exifData);
                    }

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'upload-error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.classList.add('show');
        }, 10);

        setTimeout(() => {
            errorDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }

    showProgress(elementId, progress) {
        const element = this.dropZones.get(elementId);
        if (!element) return;

        let progressBar = element.querySelector('.upload-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'upload-progress';
            element.appendChild(progressBar);
        }

        progressBar.style.width = `${progress}%`;
    }

    resetDropZone(elementId) {
        const element = this.dropZones.get(elementId);
        if (!element) return;

        element.classList.remove('drag-over');
        const progressBar = element.querySelector('.upload-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }
}

// Styles pour le drag & drop
const styles = `
    .drop-zone {
        position: relative;
        border: 2px dashed #ccc;
        border-radius: 4px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .drop-zone.drag-over {
        border-color: #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
    }

    .upload-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        background-color: #4CAF50;
        transition: width 0.3s ease;
    }

    .upload-error {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }

    .upload-error.show {
        transform: translateX(0);
    }
`;

// Ajouter les styles au document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export const uploadService = new UploadService(); 