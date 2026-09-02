export function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function splitEqual(amount, ids) {
  if (!ids || !ids.length) return {};
  const totalCents = Math.round(Number(amount) * 100);
  const n = ids.length;
  const baseCents = Math.floor(totalCents / n);
  const remainder = totalCents % n;

  const shares = {};
  ids.forEach((id, i) => {
    const cents = baseCents + (i < remainder ? 1 : 0);
    shares[id] = cents / 100;
  });
  return shares;
}

export function percentsSumTo100(percents) {
  const values = Object.values(percents).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 0.001;
}

export function splitByPercent(amount, percents) {
  const entries = Object.entries(percents);
  if (!entries.length) return {};

  const totalCents = Math.round(Number(amount) * 100);
  let allocatedCents = 0;
  const sharesInCents = {};

  entries.forEach(([id, pct]) => {
    const shareCents = Math.round((totalCents * Number(pct)) / 100);
    sharesInCents[id] = shareCents;
    allocatedCents += shareCents;
  });

  const diff = totalCents - allocatedCents;
  if (diff !== 0 && entries.length > 0) {
    // Adjust remainder cents on the entry with the highest percentage/share
    let targetId = entries[0][0];
    let maxShare = -Infinity;
    for (const [id] of entries) {
      if (sharesInCents[id] > maxShare) {
        maxShare = sharesInCents[id];
        targetId = id;
      }
    }
    sharesInCents[targetId] += diff;
  }

  const shares = {};
  for (const [id, cents] of Object.entries(sharesInCents)) {
    shares[id] = cents / 100;
  }
  return shares;
}

export function sharesForExpense(expense) {
  if (expense.splitType === "percent" && expense.percents) {
    return splitByPercent(expense.amount, expense.percents);
  }
  return splitEqual(expense.amount, expense.splitWith || []);
}

