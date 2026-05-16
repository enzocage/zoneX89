const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let P = {};
let W, H;

function resize(){
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  if(P.FOG_PCT!==undefined) P.ZOOM=fogPctToZoom(P.FOG_PCT);
}
window.addEventListener('resize', resize); resize();

let tiles = [];
let fogMap = [];
let enemies = [];
let plutoniums = [];
let barrels = [];
let doors = [];
let mats = [];
let player = {};
let lives, score, invTimer, gameState;
let puDelivered, totalPu;
let camX=0, camY=0;
let keys = {};
let lastTS = 0;

let edMode = false;
let edTiles = [], edTool = 'wa', edHX=-1, edHY=-1, edDrag=false;

let helpOpen = false;
let helpScrollY = 0;
const HELP_CONTENT = [
  {t:'head', text:'STEUERUNG'},
  {t:'ctrl', key:'WASD / ↑↓←→',  desc:'Spieler bewegen'},
  {t:'ctrl', key:'SPACE',          desc:'Matte ablegen auf letztem Rasterpunkt (auch während Bewegung)'},
  {t:'ctrl', key:'E',              desc:'Level-Editor öffnen / schließen'},
  {t:'ctrl', key:'H',              desc:'Diese Hilfe öffnen / schließen'},
  {t:'ctrl', key:'R',              desc:'Neustart (Game Over / Level Complete)'},
  {t:'gap'},
  {t:'head', text:'SPIELELEMENTE'},
  {t:'tile', col:'#00ffcc', lbl:'pl', name:'Spieler',           desc:'Du. Pixel-glatte Bewegung, Glow-Effekt.'},
  {t:'tile', col:'#0e1c2a', lbl:'fo', name:'Nebel',             desc:'Blockiert Gegner permanent. Durch Betreten zerstört → Gegner können folgen.'},
  {t:'tile', col:'#1e1e1e', lbl:'wa', name:'Wand',              desc:'Unpassierbar für alle.'},
  {t:'tile', col:'#aaff00', lbl:'pu', name:'Plutonium',         desc:'Aufsammeln startet Timer. Mehrere gleichzeitig möglich. Timer reset bei jedem Aufsammeln.'},
  {t:'tile', col:'#3377ee', lbl:'to', name:'Tonne / Barrel',    desc:'Ziel für Plutonium-Abgabe. Score +100 pro Stück.'},
  {t:'tile', col:'#8822dd', lbl:'tü', name:'Tür',               desc:'Öffnet / schließt automatisch im konfigurierbaren Takt. Immer Hindernis für Gegner.'},
  {t:'tile', col:'#bb9955', lbl:'ma', name:'Matte',             desc:'Aufsammelbar. Mit SPACE ablegen — blockiert Gegner wie eine Wand.'},
  {t:'tile', col:'#ff2233', lbl:'R',  name:'Schneller Gegner',  desc:'~2× Grundgeschwindigkeit. Pulsierender Glow. Bewegt sich geradlinig, wählt neue Richtung bei Hindernis.'},
  {t:'tile', col:'#ff7700', lbl:'r',  name:'Langsamer Gegner',  desc:'~0.5× Grundgeschwindigkeit. Orange. Gleiches Verhalten wie R.'},
  {t:'gap'},
  {t:'head', text:'MECHANIKEN'},
  {t:'rule', text:'Plutonium aufsammeln → Countdown-Timer startet (Tick-Tock, wird dringlicher)'},
  {t:'rule', text:'Stirbst du mit Plutonium → gilt als abgeliefert (zählt im Counter)'},
  {t:'rule', text:'Timer läuft ab → Leben verloren, Plutonium respawnt'},
  {t:'rule', text:'Alle Plutonium abgeliefert → Level gewonnen'},
  {t:'rule', text:'Nebel betreten → permanent entfernt; Gegner können dann diesen Weg nutzen'},
  {t:'rule', text:'Kollision mit geschlossener Tür → Leben verloren (pixelgenau)'},
  {t:'rule', text:'Kollision mit Gegner → Leben verloren (pixelgenau, bereits bei geringster Überlappung)'},
  {t:'rule', text:'3 Leben verbraucht → Game Over'},
  {t:'gap'},
  {t:'head', text:'TUNING-PANEL  ⚙'},
  {t:'rule', text:'SPEED: Spielergeschwindigkeit (px/s)'},
  {t:'rule', text:'ENEMY_F / ENEMY_S: Schnelle / Langsame Gegner (px/s)'},
  {t:'rule', text:'PU_TIMER: Sekunden bis Plutonium-Ablauf'},
  {t:'rule', text:'DOOR: Öffnungs-/Schließzyklus in Sekunden'},
  {t:'rule', text:'LIVES: Startleben'},
  {t:'rule', text:'FOG% → ZOOM: 0% = ganzes Level sichtbar · 100% = Tunnelblick (Zoom 8×)'},
  {t:'rule', text:'fog live: aktuell verbleibender Nebelanteil (sinkt beim Erkunden)'},
];
