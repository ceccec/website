export function commaSeparatedEnv(value: string | undefined): string[] {
  if (!value?.trim()) {return []}
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}
