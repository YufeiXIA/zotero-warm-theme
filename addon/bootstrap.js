/* global Zotero, Services, Components */
// Warm Theme for Zotero: recolors every Zotero window and the PDF reader's interface
// by overriding Zotero's color variables (see content/theme.css).

var chromeHandle;
var WarmTheme;

function install() {}
function uninstall() {}

async function startup({ id, rootURI }) {
	await Zotero.initializationPromise;
	const aomStartup = Components.classes["@mozilla.org/addons/addon-manager-startup;1"]
		.getService(Components.interfaces.amIAddonManagerStartup);
	chromeHandle = aomStartup.registerChrome(Services.io.newURI(rootURI + "manifest.json"), [
		["content", "zotero-warm-theme", rootURI + "content/"],
	]);
	WarmTheme = createWarmTheme(id);
	await WarmTheme.start();
}

function onMainWindowLoad({ window }) {
	WarmTheme?.decorateWindow(window);
}

function onMainWindowUnload({ window }) {
	WarmTheme?.undecorateWindow(window);
}

function shutdown() {
	try {
		WarmTheme?.stop();
	}
	finally {
		WarmTheme = undefined;
		chromeHandle?.destruct();
		chromeHandle = null;
	}
}

function createWarmTheme(pluginID) {
	const PREF = "extensions.zotero-warm-theme.enabled";
	const ATTR = "zwt-theme";
	const CSS_URL = "chrome://zotero-warm-theme/content/theme.css";
	const HTML_NS = "http://www.w3.org/1999/xhtml";
	let readerCSS = "";
	let prefObserver = null;

	const enabled = () => !!Zotero.Prefs.get(PREF, true);
	const isZoteroWindow = win => {
		try {
			return String(win.location.href).startsWith("chrome://zotero/");
		}
		catch (e) {
			return false;
		}
	};

	// Zotero's own windows: main window, reader windows, settings, dialogs
	function decorateWindow(win) {
		if (!win || win.closed || !isZoteroWindow(win)) return;
		const doc = win.document;
		if (!doc?.documentElement) return;
		if (!doc.getElementById("zwt-stylesheet")) {
			const link = doc.createElementNS(HTML_NS, "link");
			link.id = "zwt-stylesheet";
			link.rel = "stylesheet";
			link.href = CSS_URL;
			doc.documentElement.appendChild(link);
		}
		doc.documentElement.toggleAttribute(ATTR, enabled());
		if (win.ZoteroPane) addMenu(win);
	}

	function undecorateWindow(win) {
		if (!win?.document?.documentElement) return;
		const doc = win.document;
		doc.documentElement.removeAttribute(ATTR);
		doc.getElementById("zwt-stylesheet")?.remove();
		doc.getElementById("zwt-menu")?.remove();
	}

	// The reader's interface lives in its own document, which cannot load chrome:// URLs,
	// so it gets the same rules as an inline <style>.
	function decorateReader(reader) {
		const doc = reader?._iframeWindow?.document;
		if (!doc?.documentElement || !readerCSS) return;
		if (!doc.getElementById("zwt-reader-style")) {
			const style = doc.createElement("style");
			style.id = "zwt-reader-style";
			style.textContent = readerCSS;
			(doc.head || doc.documentElement).append(style);
		}
		doc.documentElement.toggleAttribute(ATTR, enabled());
	}

	function undecorateReader(reader) {
		const doc = reader?._iframeWindow?.document;
		if (!doc?.documentElement) return;
		doc.documentElement.removeAttribute(ATTR);
		doc.getElementById("zwt-reader-style")?.remove();
	}

	function addMenu(win) {
		const doc = win.document;
		const tools = doc.getElementById("menu_ToolsPopup");
		let item = doc.getElementById("zwt-menu");
		if (tools && !item) {
			item = doc.createXULElement("menuitem");
			item.id = "zwt-menu";
			item.setAttribute("type", "checkbox");
			item.setAttribute("label", String(Zotero.locale || "").startsWith("zh") ? "暖色主题" : "Warm Theme");
			item.addEventListener("command", () => Zotero.Prefs.set(PREF, !enabled(), true));
			tools.appendChild(item);
		}
		item?.setAttribute("checked", enabled() ? "true" : "false");
	}

	function allWindows() {
		const list = [];
		const en = Services.wm.getEnumerator(null);
		while (en.hasMoreElements()) list.push(en.getNext());
		return list;
	}

	function refreshAll() {
		for (const win of allWindows()) decorateWindow(win);
		for (const reader of Zotero.Reader._readers || []) decorateReader(reader);
	}

	const windowWatcher = {
		observe(subject, topic) {
			if (topic !== "domwindowopened") return;
			subject.addEventListener("load", () => decorateWindow(subject), { once: true });
		},
	};

	function onReaderToolbar(event) {
		decorateReader(event.reader);
	}

	async function start() {
		readerCSS = await Zotero.File.getContentsFromURLAsync(CSS_URL);
		Services.ww.registerNotification(windowWatcher);
		Zotero.Reader.registerEventListener("renderToolbar", onReaderToolbar, pluginID);
		prefObserver = Zotero.Prefs.registerObserver(PREF, refreshAll, true);
		refreshAll();
	}

	function stop() {
		Services.ww.unregisterNotification(windowWatcher);
		Zotero.Reader.unregisterEventListener("renderToolbar", onReaderToolbar);
		if (prefObserver) Zotero.Prefs.unregisterObserver(prefObserver);
		for (const win of allWindows()) undecorateWindow(win);
		for (const reader of Zotero.Reader._readers || []) undecorateReader(reader);
	}

	return { start, stop, decorateWindow, undecorateWindow };
}
