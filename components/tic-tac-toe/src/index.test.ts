import crypto from 'crypto'

beforeAll(() => {
  vi.stubGlobal('crypto', crypto)
})

describe('tic-tac-toe', () => {
  it('example test', () => {
    expect(true).toEqual(true)
  })
})
