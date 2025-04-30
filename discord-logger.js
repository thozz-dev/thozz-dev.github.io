class DiscordLogger {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    async log(action, data) {
        try {
            const userInfo = await this.getUserInfo();
            const systemInfo = this.getSystemInfo();

            const actionEmojis = {
                upload: "📤",
                modify: "🛠️",
                delete: "🗑️"
            };

            const embed = {
                title: `${actionEmojis[action] || '📌'} ${action.toUpperCase()} - Nouvelle Action`,
                color: this.getColorForAction(action),
                fields: [
                    {
                        name: "📄 Détails de l'action",
                        value: this.formatActionDetails(data),
                        inline: false
                    },
                    {
                        name: "👤 Utilisateur",
                        value: this.formatUserInfo(userInfo),
                        inline: false
                    },
                    {
                        name: "🖥️ Système",
                        value: this.formatSystemInfo(systemInfo),
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString()
            };

            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ embeds: [embed] })
            });

        } catch (error) {
            console.error("❌ Erreur lors de l'envoi du log Discord:", error);
        }
    }

    async getUserInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                IP: data.ip,
                Pays: data.country_name,
                Ville: data.city,
                Région: data.region,
                Fuseau: data.timezone,
                Navigateur: navigator.userAgent,
                Langue: navigator.language
            };
        } catch (error) {
            console.error("❌ Erreur récupération infos utilisateur:", error);
            return {
                Navigateur: navigator.userAgent,
                Langue: navigator.language
            };
        }
    }

    getSystemInfo() {
        return {
            Plateforme: navigator.platform,
            Résolution: `${window.screen.width}x${window.screen.height}`,
            Profondeur_couleur: `${window.screen.colorDepth} bits`,
            Fuseau_horaire: Intl.DateTimeFormat().resolvedOptions().timeZone,
            Date: new Date().toLocaleString()
        };
    }

    getColorForAction(action) {
        const colors = {
            upload: 0x00ff00,
            modify: 0xffa500,
            delete: 0xff0000
        };
        return colors[action] || 0x808080;
    }

    formatActionDetails(data) {
        const lines = [];

        if (data.image) {
            lines.push(`**🖼️ Titre :** ${data.image.title}`);
            lines.push(`**📂 Catégorie :** ${data.image.category}`);
            if (data.image.geoLocation) {
                const [lat, lon] = data.image.geoLocation;
                lines.push(`**📍 Localisation :** [${lat}, ${lon}]`);
            }
        }

        if (data.changes) {
            lines.push(`**✏️ Modifications :**`);
            for (const [key, val] of Object.entries(data.changes)) {
                lines.push(`• \`${key}\` → **${val}**`);
            }
        }

        return lines.join('\n') || 'Aucun détail disponible';
    }

    formatUserInfo(userInfo) {
        return Object.entries(userInfo)
            .map(([key, val]) => `**${key} :** ${val}`)
            .join('\n');
    }

    formatSystemInfo(systemInfo) {
        return Object.entries(systemInfo)
            .map(([key, val]) => `**${key} :** ${val}`)
            .join('\n');
    }
}

export const discordLogger = new DiscordLogger('https://discord.com/api/webhooks/1360552082595123316/ZkZQGz-LK45xL2Udhk501s_nv_UnIvSh2EFqda7QTaTvK-y8oNTigT0nXMU3JmiUnufe'); 
