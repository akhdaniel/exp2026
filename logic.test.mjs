import assert from 'node:assert'
import { fmtIDR, computeWage, computePaid, RATE } from './logic.js'

assert.equal(fmtIDR(362500), 'Rp 362,500')
assert.equal(fmtIDR(1812500), 'Rp 1,812,500')
assert.equal(computeWage(145), 145 * RATE)
assert.equal(computePaid(10), 145000, 'floor applies below computed wage')
assert.equal(computePaid(145), 362500, 'computed wage above floor')

console.log('logic check ok')