// Formats a raw numeric string into a display currency string as the
// user types, and exposes the parsed numeric value.

export function formatUsd(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

// Strips everything except digits and a single decimal point,
// and limits to 2 decimal places.
export function sanitizeAmountInput(raw) {
  let value = raw.replace(/[^0-9.]/g, "");
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }
  const [whole, decimal] = value.split(".");
  if (decimal !== undefined) {
    value = whole + "." + decimal.slice(0, 2);
  }
  return value;
}

export function parseAmount(raw) {
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : 0;
}
