export {};

const canvas = document.querySelector<HTMLCanvasElement>("#counter-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#counter-readout",
)!;
const host = document.querySelector<HTMLDivElement>("#counter-panel-host")!;
const diagnostic = document.querySelector<HTMLParagraphElement>(
  "#counter-diagnostic",
)!;
const shieldCapacity = 10;
let shieldCharge = 0;
let panel: HTMLParagraphElement | null = null;
let panelUpdates = 0;
let inspectorListener: (() => void) | null = null;

//what shield means right now, shared by HUD and inspector
interface ShieldSnapshot {
  readonly charge: number;
  readonly capacity: number;
  readonly missing: number;
}

function takeShieldSnapshot(): ShieldSnapshot {
  return {
    charge: shieldCharge,
    capacity: shieldCapacity,
    missing: shieldCapacity - shieldCharge,
  };
}

const shieldEvents = new EventTarget();
const shieldChanged = "shield-changed";

function drawMeter(shield: ShieldSnapshot): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let cell = 0; cell < shield.capacity; cell++) {
    ctx.fillStyle = cell < shield.charge ? "#27766b" : "#c9d2c9";
    ctx.fillRect(12 + cell * 28, 24, 24, 48);
  }
  ctx.fillStyle = "#233e43";
  ctx.font = "16px system-ui";
  ctx.fillText(`${shield.charge} / ${shield.capacity} shield`, 12, 100);
  readout.textContent = `Shield charge: ${shield.charge} / ${shield.capacity}`;
}

function renderInspector(
  target: HTMLParagraphElement,
  shield: ShieldSnapshot,
): void {
  target.textContent =
    `Shield charge: ${shield.charge} · Missing charge: ${shield.missing}`;
}

function openInspector(): void {
  if (panel) return;
  const opened = document.createElement("p");
  host.append(opened);
  renderInspector(opened, takeShieldSnapshot());
  const listener = () => {
    panelUpdates++;
    diagnostic.textContent = `Inspector deliveries: ${panelUpdates}`;
    renderInspector(opened, takeShieldSnapshot());
  };
  shieldEvents.addEventListener(shieldChanged, listener);
  panel = opened;
  inspectorListener = listener;
}

function closeInspector(): void {
  if (!panel || !inspectorListener) return;
  shieldEvents.removeEventListener(shieldChanged, inspectorListener);
  panel.remove();
  panel = null;
  inspectorListener = null;
}

function setShieldCharge(next: number): void {
  const bounded = Math.max(0, Math.min(shieldCapacity, next));
  if (bounded === shieldCharge) return;
  shieldCharge = bounded;
  shieldEvents.dispatchEvent(new Event(shieldChanged));
}

shieldEvents.addEventListener(shieldChanged, () => {
  drawMeter(takeShieldSnapshot());
});

document.querySelector<HTMLButtonElement>("#counter-less")!.onclick = () => {
  setShieldCharge(shieldCharge - 1);
};
document.querySelector<HTMLButtonElement>("#counter-more")!.onclick = () => {
  setShieldCharge(shieldCharge + 1);
};
document.querySelector<HTMLButtonElement>("#counter-reset")!.onclick = () => {
  setShieldCharge(0);
};
document.querySelector<HTMLButtonElement>("#counter-open")!.onclick = () => {
  openInspector();
};
document.querySelector<HTMLButtonElement>("#counter-close")!.onclick = () => {
  closeInspector();
};
drawMeter(takeShieldSnapshot());
