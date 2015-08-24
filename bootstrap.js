"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyGetter(this, "Strings", function() {
  return Services.strings.createBundle("chrome://hello/locale/hello.properties");
});

const PREF_URL_NEW_CALL = "hello.url.newCall";
const DEFAULT_URL_NEW_CALL = "https://hello.firefox.com/newcall";

XPCOMUtils.defineLazyGetter(this, "gURLNewCall", function() {
  try {
    return Services.prefs.getCharPref(PREF_URL_NEW_CALL);
  } catch (e) {
    // If the pref isn't set, return the default URL.
    return DEFAULT_URL_NEW_CALL;
  }
});

var gMenuId = null;

function loadIntoWindow(win) {
  gMenuId = win.NativeWindow.menu.add({
    name: Strings.GetStringFromName("menu.newCall"),
    callback() {
      win.BrowserApp.addTab(gURLNewCall);
    }
  });
}

function unloadFromWindow(win) {
  win.NativeWindow.menu.remove(gMenuId);
}

/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow(win) {
    // Wait for the window to finish loading
    function loadListener() {
      win.removeEventListener("load", loadListener, false);
      loadIntoWindow(win);
    };
    win.addEventListener("load", loadListener, false);
  },

  onCloseWindow(win) {
  },

  onWindowTitleChange(win, title) {
  }
};

function startup(data, reason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(win);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(data, reason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (reason == APP_SHUTDOWN) {
    return;
  }

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(win);
  }
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
