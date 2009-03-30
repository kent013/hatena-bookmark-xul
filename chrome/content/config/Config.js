
const EXPORT = ['Config'];
const PrefsBackgroundImage = 'extensions.hatenabookmark.addPanel.backgroundImage';

let Config = {
    syncALL: function() {
        if (Config.syncCheck()) return;
        let res = window.confirm(UIEncodeText('すべて同期し直すにはしばらく時間がかかります。よろしいですか？'));
        if (res) {
            hBookmark.Model.resetAll();
            Sync.sync();
        }
    },
    sync: function() {
        if (Config.syncCheck()) return;
        Sync.sync();
    },
    RemoveData: function() {
        let res = window.confirm(UIEncodeText('はてなブックマーク拡張のすべてのデータを削除します。よろしいですか？'));
        if (res) {
            let pd = DirectoryService.get("ProfD", Ci.nsIFile);
            pd.append('hatenabookmark');
            if (pd.exists() && pd.isDirectory()) {
                pd.remove(true);
            }
        }
    },
    syncCheck: function() {
        if (!User.user) {
            // むむ
            alert(UIEncodeText('この操作には、はてなへのログインが必要です'));
            // pref window がでてると、dialog 表示で addons window がおかしくなる
            // UIUtils.encourageLogin();
            return true;
        }
        if (Sync.nowSyncing) {
            // むむ
            alert(UIEncodeText('現在同期中です'));
            return true;
        }
        return false;
    },
    updateUI: function() {
        let file = document.getElementById(PrefsBackgroundImage).value;
        if (file) {
            let fileField = document.getElementById('addPanel.backgroundImage');
            fileField.file = file;
        }
    },
    clearImageFile: function() {
        let file = document.getElementById(PrefsBackgroundImage).value;
        if (file) {
            let fileField = document.getElementById('addPanel.backgroundImage');
            fileField.file = null;
            fileField.label = '';
            try {
                document.getElementById(PrefsBackgroundImage).reset();
            } catch(e) {};
        }
        // let fileField = document.getElementById('addPanel.backgroundImage');
        // fileField.file = '';
        // fileField.label = '';
    },
    selectImageFile: function() {
        let filePicker = Components.classes["@mozilla.org/filepicker;1"]
                         .createInstance(Components.interfaces.nsIFilePicker);
        filePicker.init(window, UIEncodeText("画像を選択して下さい"), filePicker.modeOpen);
        filePicker.appendFilters(Components.interfaces.nsIFilePicker.filterIamges);
        if (filePicker.show() == filePicker.returnOK) {
            document.getElementById(PrefsBackgroundImage).value = filePicker.file;
            Config.updateUI();
        }
    }
};


/*
 * base code by XUL/Migemo config.js.
 * thx Piro!
 */
Config.ShortCut = {
    prefPrefix: 'extensions.hatenabookmark.shortcut.keys.',
    KEYS: ['add'],
    keys: {},
    initPane: function() {
        var self = this;
        this.KEYS.forEach(function(key) {
            let k = document.getElementById(self.prefPrefix + key + '-input');
            k.keyData = parseShortcut(k.value);
            self.keys[key] = k;
        });
        // let add = document.getElementById('add-input');
        // add.keyData = parseShortcut(add.value);
        // this.add = add;
    },
    set: function(aNode) {
        let keyData = {};
        window.openDialog(
            'chrome://hatenabookmark/content/keyDetecter.xul',
            '_blank',
            'chrome,modal,resizable=no,titlebar=no,centerscreen',
            keyData,
            UIEncodeText('キーボードを押して、ショートカットを設定します'),
            UIEncodeText('キャンセル')
        );
        if (keyData.modified) {
            aNode.value = keyData.string;
            var event = document.createEvent('UIEvents');
            event.initUIEvent('input', true, false, window, 0);
            aNode.dispatchEvent(event);
        }
    },
    clear: function(aNode) {
        aNode.value = '';
        aNode.keyData = parseShortcut(aNode.value);
        aNode.keyData.modified = true;

        fireInputEvent(aNode);
    },
}

function fireInputEvent(aNode)
{
    var event = document.createEvent('UIEvents');
    event.initUIEvent('input', true, false, window, 0);
    aNode.dispatchEvent(event);
}




