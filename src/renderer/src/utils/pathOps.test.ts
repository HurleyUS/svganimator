import '../test/setup'
import { describe, expect, test } from 'bun:test'
import { booleanOperation, shapeToPath } from './pathOps'

describe('pathOps', () => {
  test('converts supported shapes to path data', () => {
    expect(shapeToPath('rect', { x: '0', y: '0', width: '10', height: '20' })).toContain('10')
    expect(shapeToPath('circle', { cx: '5', cy: '5', r: '3' })).toContain('5')
    expect(shapeToPath('unsupported', {})).toBe('')
  })

  test('runs boolean path operations', () => {
    const result = booleanOperation('M0,0h10v10h-10z', 'M5,5h10v10h-10z', 'unite')

    expect(result.length).toBeGreaterThan(0)
  })
})
