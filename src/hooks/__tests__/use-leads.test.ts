// Simple smoke test — verifies hook exports the right shape
describe('useLeads interface', () => {
  it('exports expected functions', () => {
    // This test verifies the module compiles with correct exports
    const mod = require('../use-leads')
    expect(typeof mod.useLeads).toBe('function')
  })
})
