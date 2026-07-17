import { app, BrowserWindow } from "electron";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Wireless Store Management System",
    width: 1600,
    height: 900,
    minWidth: 1300,
    minHeight: 750,
    autoHideMenuBar: true,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  // Open DevTools only while developing
  

  mainWindow.maximize();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});