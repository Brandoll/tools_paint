import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm(new URL('./dist/',import.meta.url),{recursive:true,force:true});
await mkdir(new URL('./dist/',import.meta.url));
for(const name of ['index.html','style.css','app.js','lock-state.mjs','sw.js','manifest.webmanifest','icon-192.png','icon-512.png'])await copyFile(new URL(name,import.meta.url),new URL(`dist/${name}`,import.meta.url));
console.log('PWA lista en dist/');
