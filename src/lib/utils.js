export const positions = [
  'GK',
  'CB',
  'LB',
  'RB',
  'LWB',
  'RWB',
  'CDM',
  'CM',
  'CAM',
  'LM',
  'RM',
  'LW',
  'RW',
  'ST',
  'CF'
]

export const feet = [
  'Right',
  'Left',
  'Both'
]

export const levels = [
  'Academy',
  'School',
  'Amateur',
  'Semi-Pro',
  'Professional'
]

export const countries = [
  'Qatar',
  'Jordan',
  'UAE',
  'Saudi Arabia',
  'Kuwait',
  'Oman',
  'Bahrain',
  'Egypt',
  'England',
  'Spain',
  'France',
  'Germany',
  'Turkey',
  'Other'
]

export function initials(name = '') {
  return (
    name
      .split(' ')
      .map(x => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PS'
  )
}

export function formatDate(v) {
  return v
    ? new Date(v).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : ''
}

export function escapeName(name = '') {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80)
}

export async function shareUrl(url, title = 'ProScout') {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url
      })

      return true
    } catch {
      return false
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    alert('Link copied')
    return true
  } catch {
    return false
  }
}
