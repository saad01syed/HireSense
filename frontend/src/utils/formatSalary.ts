function addCurrency(
  value: number,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0
): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  })
}

function normalizeSalaryText(value: string | number): string {
  return String(value)
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatSingleSalaryNumber(amount: number, isHourly: boolean): string {
  if (isHourly) {
    return `${addCurrency(amount, 2, 2)}/hr`
  }

  return addCurrency(amount, 0, 0)
}

function extractNumbers(value: string): number[] {
  const matches = value.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || []

  return matches
    .map((part) => Number(part.replace(/,/g, '')))
    .filter((num) => !Number.isNaN(num))
}

function looksHourly(value: string): boolean {
  const lower = value.toLowerCase()

  return (
    lower.includes('/hr') ||
    lower.includes('/hour') ||
    lower.includes('per hour') ||
    lower.includes('hourly') ||
    /\bhr\b/.test(lower)
  )
}

function looksAnnual(value: string): boolean {
  const lower = value.toLowerCase()

  return (
    lower.includes('/yr') ||
    lower.includes('/year') ||
    lower.includes('per year') ||
    lower.includes('annually') ||
    lower.includes('annual')
  )
}

export function formatSalary(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') {
    return 'Not listed'
  }

  const normalized = normalizeSalaryText(value)

  if (!normalized) {
    return 'Not listed'
  }

  const numbers = extractNumbers(normalized)

  if (numbers.length === 0) {
    return normalized
  }

  const isHourly = looksHourly(normalized)
  const isAnnual = looksAnnual(normalized)

  if (numbers.length >= 2) {
    const [min, max] = numbers

    if (isHourly) {
      return `${formatSingleSalaryNumber(min, true)} - ${formatSingleSalaryNumber(max, true)}`
    }

    return `${formatSingleSalaryNumber(min, false)} - ${formatSingleSalaryNumber(max, false)}`
  }

  const [amount] = numbers

  if (isHourly) {
    return formatSingleSalaryNumber(amount, true)
  }

  if (isAnnual || amount >= 1000) {
    return formatSingleSalaryNumber(amount, false)
  }

  return formatSingleSalaryNumber(amount, false)
}