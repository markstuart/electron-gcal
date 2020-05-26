const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

app.name = 'GCal'

const handleLinkClicks = (webContents) => {
  /**
   * First, we set up a dom handler that captures the click
   * on the way in, rather than out (see 'true' as last arg).
   * Then, if the target is an a tag we call window.open with
   * the href and prevent the other handlers that electron adds
   * from running. window.open triggers the 'new-window' event
   * on the webContents, and we tell the OS to use the default
   * browser to open the link.
   */
  webContents.on('dom-ready', function() {
    const script = `
      document.addEventListener('click', event => {
        if (event.target.tagName === 'A') {
          event.preventDefault();
          window.open(event.target.href);
        }
      }, true);
    `;
    webContents.executeJavaScript(script, false);
  });

  webContents.on('new-window', (event, url) => {
    event.preventDefault();
    if (url && url !== 'about:blank') {
      shell.openExternal(url);
    }
  });
}

const createWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Google Calendar",
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'icons/gcal-icon.png'),
    backgroundColor: '#fff',
  })

  // and load the index.html of the app.
  win.loadURL('https://calendar.google.com/calendar/r/week')

  handleLinkClicks(win.webContents)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)
app.allowRendererProcessReuse = true

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
