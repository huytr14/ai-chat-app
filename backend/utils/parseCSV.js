import { parse } from 'csv-parse';

export function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    parse(buffer, { columns: true, skip_empty_lines: true }, (err, records) => {
      if (err) return reject(err);
      resolve(records);
    });
  });
}

export function basicSummary(records) {
  const n = records.length;
  const columns = n ? Object.keys(records[0]) : [];
  const missingByCol = {};
  const numericStats = {};

  for (const col of columns) {
    let missing = 0;
    const nums = [];
    for (const row of records) {
      const v = row[col];
      if (v === undefined || v === null || v === '') missing++;
      else if (!isNaN(Number(v))) nums.push(Number(v));
    }
    missingByCol[col] = missing;

    if (nums.length) {
      nums.sort((a,b)=>a-b);
      const sum = nums.reduce((a,b)=>a+b, 0);
      const mean = sum / nums.length;
      const median = nums[Math.floor(nums.length/2)];
      numericStats[col] = { count: nums.length, min: nums[0], max: nums.at(-1), mean, median };
    }
  }

  const mostMissingCol = Object.entries(missingByCol).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;
  return { rows: n, columns, missingByCol, mostMissingCol, numericStats };
}
