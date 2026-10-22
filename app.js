import {createLock} from './lock-state.mjs';
const $=id=>document.getElementById(id), stage=$('stage'), pic=$('picture'), status=$('status');
let scale=1,x=0,y=0,angle=0,base=1,loaded=false,drag=null,objectURL=null,loadVersion=0,wake=null,wakePending=false,installEvent=null;
const say=text=>status.textContent=text;
function render(){pic.style.width=`${pic.naturalWidth*base}px`;pic.style.height=`${pic.naturalHeight*base}px`;pic.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale})`;$('size').value=scale*100;$('sizeLabel').value=`${Math.round(scale*100)}%`;}
function fit(){const rotated=Math.abs(angle%180)===90;const w=rotated?pic.naturalHeight:pic.naturalWidth,h=rotated?pic.naturalWidth:pic.naturalHeight;base=Math.min(stage.clientWidth/w,stage.clientHeight/h)*.9;scale=1;x=y=0;render();}
async function keepAwake(){if(!lock.locked||document.visibilityState!=='visible'||wake||wakePending)return;if(!('wakeLock'in navigator)){say('Pantalla encendida: no disponible. Ajusta la suspensión en Android.');return;}wakePending=true;try{const sentinel=await navigator.wakeLock.request('screen');if(!lock.locked){await sentinel.release();return;}wake=sentinel;sentinel.addEventListener('release',()=>{if(wake===sentinel)wake=null;say('La pantalla puede apagarse: el sistema liberó la solicitud.');});say('Imagen bloqueada. Pantalla encendida solicitada y activa.');}catch{say('Imagen bloqueada. No se pudo mantener la pantalla encendida; revisa Android.');}finally{wakePending=false;}}
const lock=createLock(locked=>{drag=null;document.body.classList.toggle('locked',locked);$('lock').hidden=!locked;$('lock').classList.remove('holding');if(locked){keepAwake();}else{if(wake){wake.release().catch(()=>{});wake=null;}say('Desbloqueado. Puedes ajustar la imagen.');}render();});
async function loadImage(src,isFile=false){const version=++loadVersion;const candidate=new Image();say('Cargando imagen…');$('load').disabled=true;try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{candidate.src='';reject(new Error('timeout'));},15000);candidate.onload=()=>{clearTimeout(timer);resolve();};candidate.onerror=()=>{clearTimeout(timer);reject(new Error('load'));};candidate.src=src;});if(version!==loadVersion||lock.locked){if(isFile)URL.revokeObjectURL(src);return;}if(objectURL)URL.revokeObjectURL(objectURL);objectURL=isFile?src:null;pic.src=src;await pic.decode();loaded=true;angle=0;fit();$('empty').hidden=true;$('empty').style.display='none';$('trace').disabled=false;say(isFile?'Imagen lista. Se conserva mientras esta página esté abierta.':'Imagen lista. Para usarla sin conexión, súbela como archivo.');}catch{if(isFile)URL.revokeObjectURL(src);if(version===loadVersion)say('No se pudo cargar. Usa un enlace directo accesible o descarga la imagen y súbela como archivo.');}finally{if(version===loadVersion)$('load').disabled=false;}}
$('loadForm').addEventListener('submit',e=>{e.preventDefault();if(lock.locked)return;try{const url=new URL($('url').value);if(!['https:','http:'].includes(url.protocol))throw Error();loadImage(url.href);}catch{say('Introduce un enlace http o https directo a una imagen.');}});
$('file').addEventListener('change',()=>{if(!lock.locked&&$('file').files[0])loadImage(URL.createObjectURL($('file').files[0]),true);$('file').value='';});
let pastePending=false;
$('paste').onclick=async()=>{
  if(lock.locked||pastePending)return;
  if(!navigator.clipboard?.read){say('Este navegador no permite pegar imágenes con el botón. Prueba Ctrl + V o usa Subir una imagen.');return;}
  pastePending=true;$('paste').disabled=true;
  try{
    const items=await navigator.clipboard.read();
    if(lock.locked)return;
    for(const item of items){
      const type=item.types.find(type=>type.startsWith('image/'));
      if(type){const blob=await item.getType(type);if(!lock.locked)await loadImage(URL.createObjectURL(blob),true);return;}
    }
    say('No hay una imagen copiada. Elige «Copiar imagen» y vuelve a pegar. Si copiaste un enlace, pégalo en el campo de enlace.');
  }catch{if(!lock.locked)say('No se pudo acceder a la imagen copiada. Permite el acceso al portapapeles si el navegador lo solicita, o usa Subir una imagen.');}
  finally{pastePending=false;$('paste').disabled=false;}
};
document.addEventListener('paste',e=>{
  if(lock.locked){e.preventDefault();return;}
  const file=Array.from(e.clipboardData?.items||[]).find(item=>item.kind==='file'&&item.type.startsWith('image/'))?.getAsFile();
  if(file){e.preventDefault();loadImage(URL.createObjectURL(file),true);}
});
$('size').addEventListener('input',()=>{if(!lock.locked){scale=Number($('size').value)/100;render();}});
$('left').onclick=()=>{if(loaded&&!lock.locked){angle=(angle-90)%360;render();}};
$('fit').onclick=()=>{if(loaded&&!lock.locked)fit();};$('reset').onclick=()=>{if(loaded&&!lock.locked){angle=0;fit();}};
stage.addEventListener('pointerdown',e=>{e.preventDefault();if(lock.locked||!loaded||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:x,startY:y};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(lock.locked||!drag||e.pointerId!==drag.id)return;x=drag.startX+e.clientX-drag.x;y=drag.startY+e.clientY-drag.y;render();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,()=>drag=null);
$('trace').onclick=async()=>{if(!loaded||lock.locked)return;lock.lock();if(!document.fullscreenElement){try{if(!document.documentElement.requestFullscreen)throw Error();await document.documentElement.requestFullscreen();}catch{const message='Imagen bloqueada. Pantalla completa no disponible o rechazada; puedes seguir calcando en esta vista. Mantén el candado un segundo para ajustar.';say(message);alert(message);}}};
const cancelHold=()=>{lock.cancel();$('lock').classList.remove('holding');};
$('lock').addEventListener('pointerdown',e=>{e.preventDefault();if(e.isPrimary===false)return;$('lock').setPointerCapture(e.pointerId);$('lock').classList.add('holding');lock.hold();});
for(const type of ['pointerup','pointercancel','lostpointercapture','pointerleave'])$('lock').addEventListener(type,cancelHold);
$('lock').addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat){$('lock').classList.add('holding');lock.hold();}}});
$('lock').addEventListener('keyup',cancelHold);$('lock').addEventListener('blur',cancelHold);
window.addEventListener('blur',cancelHold);
document.addEventListener('visibilitychange',()=>{cancelHold();if(document.visibilityState==='visible')keepAwake();});
document.addEventListener('fullscreenchange',()=>{cancelHold();render();if(lock.locked&&!document.fullscreenElement)say('Sigues bloqueado aunque hayas salido de pantalla completa. Mantén el candado un segundo para ajustar.');});
window.addEventListener('resize',()=>{cancelHold();render();});
for(const type of ['touchmove','wheel','contextmenu','gesturestart'])document.addEventListener(type,e=>{if(lock.locked)e.preventDefault();},{passive:false});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installEvent){await installEvent.prompt();installEvent=null;$('install').hidden=true;}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>say('No se pudo activar el modo offline. Usa HTTPS o localhost y vuelve a abrir.'));

