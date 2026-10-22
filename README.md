# Calcar · mesa de luz

PWA estática en español, sin cuenta, backend ni dependencias de ejecución.

## Abrir en este equipo

Desde esta carpeta:

```sh
npm start
```

Abre http://127.0.0.1:4287. No abras index.html directamente: el service worker necesita localhost o HTTPS.

## Publicar en Vercel

Importa esta carpeta como proyecto mediante un repositorio Git, o ejecuta `npx vercel` desde esta carpeta con tu cuenta. Elige framework **Other**, comando `npm run build` y salida `dist`. `vercel.json` ya contiene esos valores. Publica con `npx vercel --prod` cuando hayas revisado el preview. No hay variables ni secretos que configurar. No se ha publicado desde este entorno.

En Android abre la URL HTTPS publicada con Chrome y usa **Instalar aplicación** o el menú del navegador. El botón Instalar aparece cuando Chrome ofrece la instalación. La instalación y las API dependen del navegador; no se finge su disponibilidad.

## Uso

1. Copia una imagen y pulsa **Pegar imagen**, pega con Ctrl + V, usa un enlace directo accesible o sube un archivo. El botón solicita acceso al portapapeles solo al pulsarlo. Si el navegador lo rechaza o no admite imágenes, se indica cómo usar la carga de archivo. No se lee ni se muestra texto del portapapeles.
2. Arrastra para posicionar, cambia el tamaño y gira. Encajar conserva proporciones.
3. Pulsa Calcar: solicita Fullscreen API real y bloquea la interfaz. Si la API falla, aparece una explicación.
4. Solo mantener pulsado el candado durante un segundo devuelve los controles. Soltar, cancelar, perder el foco o cambiar de pantalla cancela la pulsación. Salir de pantalla completa conserva bloqueo y ajustes.

La imagen no se guarda al cerrar o recargar. El shell funciona offline tras una primera visita con el service worker instalado; imágenes remotas no se cachean. Para trabajar offline, abre un archivo desde el dispositivo. El navegador no puede bloquear gestos/botones del sistema. Ajusta brillo y suspensión en Android; Wake Lock se solicita y su rechazo/liberación se registra en el estado, consultable al desbloquear. Fullscreen y Wake Lock se deben comprobar en el dispositivo real.

## Verificación

```sh
npm test
npm run build
```

Las doce pruebas automatizadas y la compilación pasaron. La vista local respondió con HTTP 200 y se confirmó visualmente en el navegador. Queda pendiente comprobar la adaptación en dispositivos reales, instalación/offline, Fullscreen y Wake Lock en Chrome Android y una tablet física. Los servidores de prueba se cerraron después de la revisión.


