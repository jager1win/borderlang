import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';

export default class BorderLangPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();
        window.add(page);

        const langGroup = new Adw.PreferencesGroup({ title: 'Цвета раскладок' });
        page.add(langGroup);

        // Читаем раскладки напрямую из системных настроек рабочего стола
        const desktopSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.input-sources' });
        const sources = desktopSettings.get_value('sources');
        
        let config;
        try {
            config = JSON.parse(settings.get_string('config-json'));
        } catch (e) {
            config = {};
        }

        for (let i = 0; i < sources.n_children(); i++) {
            const variant = sources.get_child_value(i);
            // Извлекаем кортеж [type, id] через unpack()
            const [type, id] = variant.recursive_unpack ? variant.recursive_unpack() : variant.deep_unpack();
            
            const row = new Adw.ActionRow({ title: `Цвет для ${id.toUpperCase()}` });
            const btn = new Gtk.ColorButton({ 
                rgba: this._hexToRgba(config[id] || '#ffffff'),
                valign: Gtk.Align.CENTER 
            });

            btn.connect('color-set', () => {
                config[id] = this._rgbaToHex(btn.get_rgba());
                settings.set_string('config-json', JSON.stringify(config));
            });

            row.add_suffix(btn);
            langGroup.add(row);
        }

        // Группа Геометрия
        const geoGroup = new Adw.PreferencesGroup({ title: 'Геометрия' });
        page.add(geoGroup);

        const widthRow = new Adw.SpinRow({
            title: 'Толщина',
            adjustment: new Gtk.Adjustment({ lower: 1, upper: 10, step_increment: 1, value: settings.get_int('border-width') })
        });
        settings.bind('border-width', widthRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        geoGroup.add(widthRow);

        const radiusRow = new Adw.SpinRow({
            title: 'Скругление',
            adjustment: new Gtk.Adjustment({ lower: 0, upper: 30, step_increment: 1, value: settings.get_int('border-radius') })
        });
        settings.bind('border-radius', radiusRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        geoGroup.add(radiusRow);
    }

    _hexToRgba(hex) {
        const rgba = new Gdk.RGBA();
        rgba.parse(hex);
        return rgba;
    }

    _rgbaToHex(rgba) {
        const r = Math.round(rgba.red * 255).toString(16).padStart(2, '0');
        const g = Math.round(rgba.green * 255).toString(16).padStart(2, '0');
        const b = Math.round(rgba.blue * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
}
