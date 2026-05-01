/**
 * Shared helpers for Cursor rule generators (`generate-*-cursor-rules.mjs`).
 */
/** Third column: backtick-wrapped rule filename for markdown */
export function ruleMdc(name) {
  return `\`${name}\``
}

export function hubTable3(headerLine, separatorLine, rows) {
  const body = rows.map(([a, b, c]) => `| ${a} | ${b} | ${c} |`).join('\n')
  return `${headerLine}\n${separatorLine}\n${body}`
}

export function moreLine(parts) {
  return `**More:** ${parts.join(' · ')}`
}
