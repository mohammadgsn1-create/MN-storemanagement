

// main.js
// Main process for Electron app

const { app, BrowserWindow } = require('electron');
const path = require('path');
// const phpPath = app.isPackaged

const { spawn } = require('child_process');

let mainWindow; // Keep a global reference to avoid garbage collection
let phpServer;
const phpPath = app.isPackaged
?path.join(process.resourcesPath,'php' , 'php.exe')
:path.join(__dirname , 'php' , 'php.exe')
// Function to create the main application window
function startLaravelServer() {
  const publicPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'public')
    : path.join(__dirname, 'backend', 'public');

  phpServer = spawn(phpPath, ['-S', '127.0.0.1:8000', '-t', publicPath]);

  phpServer.stdout.on('data', (data) => console.log(`PHP: ${data}`));
  phpServer.stderr.on('data', (data) => console.error(`PHP Error: ${data}`));
}
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { // Optional preload script
            nodeIntegration: false, // Security: disable Node.js in renderer unless needed
            contextIsolation: true  // Security: isolate context
        }
    });

    // Load your HTML file
    mainWindow.loadFile('./front-end/pages/index.html');

    // Optional: Open DevTools in development mode
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App ready event
app.whenReady().then(() => {
  startLaravelServer();
  createWindow();
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (phpServer) phpServer.kill();
  if (process.platform !== 'darwin') app.quit();
});


// Re-create window when app is activated (macOS behavior)
app.on('before-quit', () => {
  if (phpServer) phpServer.kill();
});
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});





