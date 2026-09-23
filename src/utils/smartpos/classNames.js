export function classNames(...args) {
  const out = [];

  const walk = (a) => {
    if (!a) return;
    if (typeof a === 'string' || typeof a === 'number') {
      out.push(String(a));
    } else if (Array.isArray(a)) {
      a.forEach(walk);
    } else if (typeof a === 'object') {
      for (const [k, v] of Object.entries(a)) {
        if (v) out.push(k);
      }
    }
  };

  args.forEach(walk);
  return out.join(' ');
}

export default classNames;