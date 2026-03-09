import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class BorderLangExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        
        // В GNOME 45-49 менеджер доступен напрямую через Main
        this._inputManager = Main.inputSourceManager;

        if (this._inputManager) {
            this._changedId = this._inputManager.connect('current-source-changed', () => {
                this._updateStyles();
            });
            
            // Слушаем изменения настроек (толщина, радиус, цвета)
            this._settingsId = this._settings.connect('changed', () => this._updateStyles());

            // Запуск
            setTimeout(() => this._updateStyles(), 500);
        }
    }

    disable() {
        if (this._changedId) this._inputManager.disconnect(this._changedId);
        if (this._settingsId) this._settings.disconnect(this._settingsId);
        this._clearStyles();
        this._settings = null;
    }

    _updateStyles() {
        try {
            let config = {};
            try {
                config = JSON.parse(this._settings.get_string('config-json'));
            } catch (e) {
                console.log('BorderLang: JSON parse error, using defaults');
                config = { 'en': '#3584e4', 'ru': '#ed333b' };
            }

            const width = this._settings.get_int('border-width') || 2;
            const radius = this._settings.get_int('border-radius') || 6;
            
            const source = this._inputManager?.currentSource;
            if (!source) return;

            const shortId = source.id.split(':').filter(x => x).find(x => x.length === 2) || source.id;
            const color = config[shortId] || '#ffffff';

            const style = `border: ${width}px solid ${color} !important; border-radius: ${radius}px;`;

            Main.panel.set_style(style);

            // Dash-to-Dock (Пробуем все известные пути сразу)
            const dtdContainer = Main.layoutManager.dash?._container || 
                                 Main.uiGroup.get_children().find(c => c.get_name && c.get_name() === 'dashtodockContainer');

            if (dtdContainer && dtdContainer.set_style) {
                dtdContainer.set_style(style);
            }
        } catch (err) {
            console.log(`BorderLang Global Error: ${err}`);
        }
    }


    _clearStyles() {
        Main.panel.set_style(null);
        let dtd = Main.layoutManager.dash?._container;
        if (!dtd) {
            dtd = Main.uiGroup.get_children().find(c => c.get_name && c.get_name() === 'dashtodockContainer');
        }
        if (dtd && dtd.set_style) dtd.set_style(null);
    }
}
