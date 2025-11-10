/**
 * Utility function to conditionally join class names
 * Similar to the popular 'classnames' or 'clsx' libraries
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Conditionally apply class names based on conditions
 */
export const conditionalClass = (
  baseClass: string,
  conditionalClasses: Record<string, boolean>
): string => {
  const additional = Object.entries(conditionalClasses)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ')

  return `${baseClass} ${additional}`.trim()
}
