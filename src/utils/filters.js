export function summarize(selected, options, allLabel) {
  if (selected.length === 0) return allLabel;
  return options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ');
}
