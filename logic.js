export const RATE = 2500
export const MIN_FLOOR = 145000

export const fmtIDR = (n) => 'Rp ' + Math.round(n).toLocaleString('en-US')

export const computeWage = (kg) => kg * RATE

export const computePaid = (kg) => Math.max(computeWage(kg), MIN_FLOOR)