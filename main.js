// main.js
// Main process for Electron app

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const net = require('net');
const { spawn, exec } = require('child_process');

let mainWindow; // Keep a global reference to avoid garbage collection
let phpServer;

const PHP_PORT = 8000;
const PHP_HOST = '127.0.0.1';

const phpPath = app.isPackaged
  ? path.join(process.resourcesPath, 'php', 'php.exe')
  : path.join(__dirname, 'php', 'php.exe');

// ---- Check if the port is already in use (e.g. a leftover PHP server
// from a previous run that never got killed) ----
function isPortTaken(port, host) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true))   // port is taken
      .once('listening', () => {
        tester.close(() => resolve(false)); // port is free
      })
      .listen(port, host);
  });
}

// ---- Forcefully kill whatever process is bound to PHP_PORT on Windows.
// Needed because a stray php.exe from a previous run (e.g. the app was
// force-closed) won't respond to our normal phpServer.kill() call, since
// that only tracks the process from THIS run. ----
function killWhateverIsOnPort(port) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve();
    // Find the PID bound to the port, then kill it
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err || !stdout) return resolve();
      const pidMatch = stdout.trim().split(/\s+/).pop();
      const pid = Number(pidMatch);
      if (!pid) return resolve();
      exec(`taskkill /PID ${pid} /F /T`, () => resolve());
    });
  });
}

// ---- Start the Laravel (php built-in server) backend ----
async function startLaravelServer() {
  const publicPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'public')
    : path.join(__dirname, 'backend', 'public');

  // Recover from a leftover server before starting a new one
  const taken = await isPortTaken(PHP_PORT, PHP_HOST);
  if (taken) {
    console.warn(`Port ${PHP_PORT} already in use — killing leftover process before starting.`);
    await killWhateverIsOnPort(PHP_PORT);
  }

  phpServer = spawn(phpPath, ['-S', `${PHP_HOST}:${PHP_PORT}`, '-t', publicPath]);

  phpServer.stdout.on('data', (data) => console.log(`PHP: ${data}`));
  phpServer.stderr.on('data', (data) => console.error(`PHP Error: ${data}`));

  phpServer.on('error', (err) => {
    console.error('Failed to start PHP server:', err);
    dialog.showErrorBox(
      'Backend failed to start',
      `The local server could not start (${err.message}). Try restarting the app.`
    );
  });

  phpServer.on('exit', (code, signal) => {
    console.log(`PHP server exited (code=${code}, signal=${signal})`);
    phpServer = null;
  });
}

// ---- Kill the PHP server this run started, and wait for it to actually die ----
function stopLaravelServer() {
  return new Promise((resolve) => {
    if (!phpServer) return resolve();
    const proc = phpServer;
    proc.once('exit', () => resolve());
    if (process.platform === 'win32') {
      // taskkill with /T also kills any child processes under it
      exec(`taskkill /PID ${proc.pid} /F /T`, () => {});
    } else {
      proc.kill('SIGTERM');
    }
    // Safety net in case the exit event never fires
    setTimeout(resolve, 2000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Security: disable Node.js in renderer unless needed
      contextIsolation: true  // Security: isolate context
    }
  });

  mainWindow.loadFile('./front-end/pages/index.html');

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready event
app.whenReady().then(async () => {
  await startLaravelServer();
  createWindow();
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', async () => {
  await stopLaravelServer();
  if (process.platform !== 'darwin') app.quit();
});

// Extra safety net so the PHP server is never left running behind us
app.on('before-quit', async (event) => {
  if (phpServer) {
    event.preventDefault();
    await stopLaravelServer();
    app.exit(0);
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
