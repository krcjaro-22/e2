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
interface SupplyBarRow {
  readonly label: string;
  readonly color: string;
  readonly valueOf: (shift: ShiftReport) => number;
}

const supplyBarRows: readonly SupplyBarRow[] = [
  { label: "Production", color: "#27766b", valueOf: (s) => s.suppliesProduced },
  { label: "Consumption", color: "#a44d23", valueOf: (s) => s.suppliesShared },
];

const firstRowLabelY = 102;
const rowSpacing = 52;
const barOffset = 8;
const barHeight = 20;
const pxPerSupply = 14;
const labelColor = "#233e43";

function drawSupplyBars(shift: ShiftReport): void {
  ctx.font = "14px system-ui";
  supplyBarRows.forEach((row, index) => {
    const labelY = firstRowLabelY + index * rowSpacing;
    const value = row.valueOf(shift);
    ctx.fillStyle = labelColor;
    ctx.fillText(`${row.label}: ${value}`, 18, labelY);
    ctx.fillStyle = row.color;
    ctx.fillRect(18, labelY + barOffset, value * pxPerSupply, barHeight);
  });
}

function drawShift(shift: ShiftReport): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCrewRoster(shift);
  ctx.fillStyle = labelColor;
  ctx.font = "14px system-ui";
  ctx.fillText(`Producers: ${shift.supplyCrew} / ${shift.crewSize}`, 18, 76);
  drawSupplyBars(shift);
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
