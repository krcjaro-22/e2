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

interface ShiftReport {
  readonly crewSize: number;
  readonly supplyCrew: number;
  readonly suppliesProduced: number;
  readonly suppliesShared: number;
  readonly balance: number;
}

function calculateShift(supplyCrew: number): ShiftReport {
  const suppliesProduced = supplyCrew * suppliesPerSupplyShift;
  const suppliesShared = crewSize * suppliesPerResident;
  return {
    crewSize: crewSize,
    supplyCrew,
    suppliesProduced,
    suppliesShared,
    balance: suppliesProduced - suppliesShared,
  };
}

function formatBalance(balance: number): string {
  return `${balance > 0 ? "+" : ""}${balance}`;
}

function drawCrewRoster(shift: ShiftReport): void {
  for (let seat = 0; seat < shift.crewSize; seat++) {
    const onSupplies = seat < shift.supplyCrew;
    ctx.fillStyle = onSupplies ? "#27766b" : "#c9d2c9";
    ctx.fillRect(18 + seat * 45, 16, 36, 36);
    ctx.fillStyle = onSupplies ? "#ffffff" : "#233e43";
    ctx.font = "16px system-ui";
    ctx.fillText(String(seat + 1), 31 + seat * 45, 40);
  }
}

function drawShift(shift: ShiftReport): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCrewRoster(shift);
  ctx.fillStyle = "#233e43";
  ctx.font = "14px system-ui";
  ctx.fillText(`Producers: ${shift.supplyCrew} / ${shift.crewSize}`, 18, 76);
  ctx.fillText(`Production: ${shift.suppliesProduced}`, 18, 102);
  ctx.fillStyle = "#27766b";
  ctx.fillRect(18, 110, shift.suppliesProduced * 14, 20);
  ctx.fillStyle = "#233e43";
  ctx.fillText(`Consumption: ${shift.suppliesShared}`, 18, 154);
  ctx.fillStyle = "#a44d23";
  ctx.fillRect(18, 162, shift.suppliesShared * 14, 20);
}

function writeReadout(shift: ShiftReport): void {
  readout.textContent =
    `Assigned: ${shift.supplyCrew}/${shift.crewSize} · Production: ${shift.suppliesProduced} · Consumption: ${shift.suppliesShared} · Balance: ${
      formatBalance(shift.balance)
    }`;
}

function renderShift(): void {
  const shift = calculateShift(supplyCrew);
  drawShift(shift);
  writeReadout(shift);
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
