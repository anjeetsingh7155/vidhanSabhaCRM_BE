export function inchargeOf(row: { inchargeName: string | null; inchargePhones: string[] }) {
  return row.inchargeName ? { name: row.inchargeName, phones: row.inchargePhones } : null;
}