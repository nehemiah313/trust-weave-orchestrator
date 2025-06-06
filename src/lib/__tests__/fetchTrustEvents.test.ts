import { fetchTrustEvents } from '../fetchTrustEvents'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from() {
        return {
          select() {
            return {
              order() {
                return {
                  limit() {
                    return Promise.resolve({
                      data: [{
                        id: 'evt1',
                        patent_claim_id: 'fake-claim-123'
                      }],
                      error: null
                    })
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})

describe('fetchTrustEvents', () => {
  it('returns trust events with fake patent claim id', async () => {
    const events = await fetchTrustEvents()
    expect(events[0].patent_claim_id).toBe('fake-claim-123')
  })
})
