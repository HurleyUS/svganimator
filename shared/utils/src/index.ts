// fallow-ignore-file coverage-gaps
/** Joins truthy CSS class names into a single class string. */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
