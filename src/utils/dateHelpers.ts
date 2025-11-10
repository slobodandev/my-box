import { format, formatDistance, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Format date to readable format (e.g., "Oct 26, 2023")
 */
export const formatDateReadable = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

/**
 * Format date and time to readable format (e.g., "Oct 26, 2023 10:30 AM")
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy h:mm a')
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Format distance between two dates
 */
export const formatDateDistance = (dateLeft: Date | string, dateRight: Date | string): string => {
  const dateLeftObj = typeof dateLeft === 'string' ? parseISO(dateLeft) : dateLeft
  const dateRightObj = typeof dateRight === 'string' ? parseISO(dateRight) : dateRight
  return formatDistance(dateLeftObj, dateRightObj)
}

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}
