'use strict';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
const {dialog} = require('electron')

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {

  // ブラウザ(Chromium)の起動, 初期画面のロード
  mainWindow = new BrowserWindow(
    {
      width: 800,
      height: 600,
      autoHideMenuBar: true,
    }
  );
  let filepath;
  if (2 <= process.argv.length && process.argv[process.argv.length - 1].endsWith('.mdg')) {
    filepath = process.argv[process.argv.length - 1]; // TODO
  } else {
    filepath = '';
  }

  mainWindow.loadURL('file://' + __dirname + '/index.html' + (filepath ? '#' + encodeURIComponent(filepath) : ''));

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});