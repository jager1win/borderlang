ln -s ~/Development/borderlang ~/.local/share/gnome-shell/extensions/borderlang@jager1win

cp -a ~/Development/borderlang/. ~/.local/share/gnome-shell/extensions/borderlang@jager1win/


gnome-extensions enable borderlang@jager1win
gnome-extensions disable borderlang@jager1win

journalctl -f -o cat /usr/bin/gnome-shell
journalctl --since "5 minutes ago" | grep -i borderlang
tail -f ~/.local/share/gnome-shell/extension.log


journalctl -f -o cat /usr/bin/gnome-shell | grep BorderLang

glib-compile-schemas schemas/