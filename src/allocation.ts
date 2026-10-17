export {};

// everyone on kestrel is provision, whatever work their shift upholds
const crewSize = 6;
const suppliesPerSupplyShift = 3;
const suppliesPerResident = 1;
const defaultSupplyCrew = 2;

const canvas = document.querySelector<HTMLCanvasElement>("#allocation-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#allocation-readout",
)!;
//residents on supply duty, others are on care, repair, or rest
let supplyCrew = defaultSupplyCrew;

function suppliesProduced(crewOnSupplies: number): number {
  return crewOnSupplies * suppliesPerSupplyShift;
}

function suppliesShared(): number {
  return crewSize * suppliesPerResident;
}

function formatBalance(balance: number): string {
  return `${balance > 0 ? "+" : ""}${balance}`;
}

function drawCrewRoster(crewOnSupplies: number): void {
  for (let seat = 0; seat < crewSize; seat++) {
    const onSupplies = seat < crewOnSupplies;
    ctx.fillStyle = onSupplies ? "#27766b" : "#c9d2c9";
    ctx.fillRect(18 + seat * 45, 16, 36, 36);
    ctx.fillStyle = onSupplies ? "#ffffff" : "#233e43";
    ctx.font = "16px system-ui";
    ctx.fillText(String(seat + 1), 31 + seat * 45, 40);
  }
}

function drawProvisioning(
  crewOnSupplies: number,
  produced: number,
  shared: number,
): void {
  ctx.fillStyle = "#233e43";
  ctx.font = "14px system-ui";
  ctx.fillText(`Producers: ${crewOnSupplies} / ${crewSize}`, 18, 76);
  ctx.fillText(`Production: ${produced}`, 18, 102);
  ctx.fillStyle = "#27766b";
  ctx.fillRect(18, 110, produced * 14, 20);
  ctx.fillStyle = "#233e43";
  ctx.fillText(`Consumption: ${shared}`, 18, 154);
  ctx.fillStyle = "#a44d23";
  ctx.fillRect(18, 162, shared * 14, 20);
}

function renderShift(): void {
  const produced = suppliesProduced(supplyCrew);
  const shared = suppliesShared();
  const balance = produced - shared;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCrewRoster(supplyCrew);
  drawProvisioning(supplyCrew, produced, shared);
  readout.textContent =
    `Assigned: ${supplyCrew}/${crewSize} · Production: ${produced} · Consumption: ${shared} · Balance: ${
      formatBalance(balance)
    }`;
}

function assignSupplyCrew(count: number): void {
  supplyCrew = Math.min(crewSize, Math.max(0, count));
  renderShift();
}

document.querySelector<HTMLButtonElement>("#allocation-less")!.onclick = () =>
  assignSupplyCrew(supplyCrew - 1);
document.querySelector<HTMLButtonElement>("#allocation-more")!.onclick = () =>
  assignSupplyCrew(supplyCrew + 1);
document.querySelector<HTMLButtonElement>("#allocation-reset")!.onclick = () =>
  assignSupplyCrew(defaultSupplyCrew);
renderShift();
