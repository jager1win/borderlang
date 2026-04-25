import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as InputSourceManager from 'resource:///org/gnome/shell/ui/status/keyboard.js';

export default class BorderLangExtension extends Extension {
    enable() {
        // Получаем менеджер через его конструктор/синглтон
        this._inputManager = InputSourceManager.getInputSourceManager();
        
        if (this._inputManager) {
            this._changedId = this._inputManager.connect('current-source-changed', () => {
                this._updateStyles();
            });
            
            // Задержка, чтобы UI успел прогрузиться
            setTimeout(() => this._updateStyles(), 500);
            
            console.log("BorderLang: Manager initialized via InputSourceManager");
        } else {
            console.log("BorderLang: ERROR - Still no manager found");
        }
    }

    disable() {
        if (this._changedId && this._inputManager) {
            this._inputManager.disconnect(this._changedId);
        }
        this._clearStyles();
    }

    _updateStyles() {
        if (!this._inputManager) return;
        
        const source = this._inputManager.currentSource;
        if (!source) return;

        const isRu = source.id.includes('ru');
        const color = isRu ? 'red' : 'blue';
        const style = `border: 3px solid ${color} !important; border-radius: 8px;`;

        // 1. Панель (тут всё ок)
        Main.panel.set_style(style);

        // 2. Dash-to-Dock - бьем по всем фронтам
        // Ищем контейнер по ID из твоего CSS (#dashtodockContainer)
        const dtdContainer = Main.layoutManager.dash?._container || 
                             Main.uiGroup.get_children().find(c => c.get_name && c.get_name() === 'dashtodockContainer');

        if (dtdContainer) {
            dtdContainer.set_style(style);
        }

        // Дополнительно ищем сам внутренний Dash
        if (Main.layoutManager.dash && Main.layoutManager.dash.set_style) {
            Main.layoutManager.dash.set_style(style);
        }
    }


    _clearStyles() {
        Main.panel.set_style(null);
        if (Main.layoutManager.dash && Main.layoutManager.dash.set_style) {
            Main.layoutManager.dash.set_style(null);
        }
    }
}
