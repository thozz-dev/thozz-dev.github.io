class ExifService {
    constructor() {
        this.exifData = null;
    }

    async extractExifData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const view = new DataView(e.target.result);
                    const exifData = this.parseExifData(view);
                    this.exifData = exifData;
                    resolve(exifData);
                } catch (error) {
                    console.error('Erreur lors de l\'extraction des données EXIF:', error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsArrayBuffer(file);
        });
    }

    parseExifData(view) {
        const exifData = {
            camera: null,
            lens: null,
            focalLength: null,
            aperture: null,
            shutterSpeed: null,
            iso: null,
            date: null
        };

        try {
            // Vérifier si c'est un JPEG
            if (view.getUint16(0, false) !== 0xFFD8) {
                throw new Error('Format non supporté');
            }

            const length = view.byteLength;
            let offset = 2;

            while (offset < length) {
                if (view.getUint16(offset, false) === 0xFFE1) {
                    const exifLength = view.getUint16(offset + 2, false);
                    const tiffOffset = offset + 10;
                    const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
                    const tags = this.readExifTags(view, tiffOffset + 8, littleEndian);
                    exifData.camera = this.getCameraModel(tags);
                    exifData.lens = this.getLensModel(tags);
                    exifData.focalLength = this.getFocalLength(tags);
                    exifData.aperture = this.getAperture(tags);
                    exifData.shutterSpeed = this.getShutterSpeed(tags);
                    exifData.iso = this.getISO(tags);
                    exifData.date = this.getDateTime(tags);

                    break;
                }
                offset += 2 + view.getUint16(offset + 2, false);
            }
        } catch (error) {
            console.warn('Erreur lors du parsing EXIF:', error);
        }

        return exifData;
    }

    readExifTags(view, start, littleEndian) {
        const tags = {};
        const entries = view.getUint16(start, littleEndian);
        let offset = start + 2;

        for (let i = 0; i < entries; i++) {
            const tag = view.getUint16(offset, littleEndian);
            const type = view.getUint16(offset + 2, littleEndian);
            const count = view.getUint32(offset + 4, littleEndian);
            const valueOffset = offset + 8;

            tags[tag] = this.readTagValue(view, type, count, valueOffset, littleEndian);
            offset += 12;
        }

        return tags;
    }

    readTagValue(view, type, count, offset, littleEndian) {
        switch (type) {
            case 1: // BYTE
                return view.getUint8(offset);
            case 2: // ASCII
                let str = '';
                for (let i = 0; i < count - 1; i++) {
                    str += String.fromCharCode(view.getUint8(offset + i));
                }
                return str;
            case 3: // SHORT
                return view.getUint16(offset, littleEndian);
            case 4: // LONG
                return view.getUint32(offset, littleEndian);
            case 5: // RATIONAL
                return {
                    numerator: view.getUint32(offset, littleEndian),
                    denominator: view.getUint32(offset + 4, littleEndian)
                };
            default:
                return null;
        }
    }

    getCameraModel(tags) {
        const make = tags[0x010F] || '';
        const model = tags[0x0110] || '';
        return `${make} ${model}`.trim();
    }

    getLensModel(tags) {
        return tags[0xA434] || null;
    }

    getFocalLength(tags) {
        const focalLength = tags[0x920A];
        if (focalLength && focalLength.numerator && focalLength.denominator) {
            const value = focalLength.numerator / focalLength.denominator;
            return `${value.toFixed(0)}mm`;
        }
        return null;
    }

    getAperture(tags) {
        const aperture = tags[0x829A];
        if (aperture && aperture.numerator && aperture.denominator) {
            const value = aperture.numerator / aperture.denominator;
            return `f/${value.toFixed(1)}`;
        }
        return null;
    }

    getShutterSpeed(tags) {
        const shutterSpeed = tags[0x829A];
        if (shutterSpeed && shutterSpeed.numerator && shutterSpeed.denominator) {
            const value = shutterSpeed.numerator / shutterSpeed.denominator;
            if (value >= 1) {
                return `1/${Math.round(value)}s`;
            } else {
                return `${value.toFixed(1)}s`;
            }
        }
        return null;
    }

    getISO(tags) {
        return tags[0x8827] || null;
    }

    getDateTime(tags) {
        const dateTime = tags[0x9003] || tags[0x9004];
        if (dateTime) {
            return new Date(dateTime.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
        }
        return null;
    }

    formatExifData(exifData) {
        return {
            camera: exifData.camera || 'Inconnu',
            lens: exifData.lens || 'Inconnu',
            focalLength: exifData.focalLength || 'Inconnu',
            aperture: exifData.aperture || 'Inconnu',
            shutterSpeed: exifData.shutterSpeed || 'Inconnu',
            iso: exifData.iso || 'Inconnu',
            date: exifData.date ? exifData.date.toLocaleDateString() : 'Inconnu'
        };
    }
}

export const exifService = new ExifService(); 