import { describe, it, expect } from 'vitest'
import { ConversationManager } from '../runtime/conversation-manager.ts'

describe('ConversationManager', () => {
  it('initializes with system message', () => {
    const cm = new ConversationManager('You are helpful.')
    const msgs = cm.getMessages()
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toEqual({ role: 'system', content: 'You are helpful.' })
  })

  it('accumulates messages', () => {
    const cm = new ConversationManager('system')
    cm.addMessage({ role: 'user', content: 'hello' })
    cm.addMessage({ role: 'assistant', content: 'hi' })
    expect(cm.getMessages()).toHaveLength(3)
  })

  it('prunes when exceeding maxMessages', () => {
    const cm = new ConversationManager('system', { maxMessages: 5 })
    for (let i = 0; i < 10; i++) {
      cm.addMessage({ role: 'user', content: `msg ${i}` })
    }
    const msgs = cm.getMessages()
    expect(msgs.length).toBeLessThanOrEqual(5)
    expect(msgs[0]).toEqual({ role: 'system', content: 'system' })
  })

  it('clears session and resets to system prompt', () => {
    const cm = new ConversationManager('system')
    cm.addMessage({ role: 'user', content: 'hello' })
    cm.clear('new system')
    const msgs = cm.getMessages()
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toEqual({ role: 'system', content: 'new system' })
  })

  it('addMessages adds multiple at once', () => {
    const cm = new ConversationManager('system')
    cm.addMessages([
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ])
    expect(cm.getMessages()).toHaveLength(3)
  })

  it('reports token count', () => {
    const cm = new ConversationManager('system')
    const initialTokens = cm.getTokenCount()
    cm.addMessage({ role: 'user', content: 'hello world' })
    expect(cm.getTokenCount()).toBeGreaterThan(initialTokens)
  })

  it('prunes when exceeding maxTokens', () => {
    // Very low token budget to force pruning
    const cm = new ConversationManager('system', { maxTokens: 30 })
    cm.addMessage({ role: 'user', content: 'This is a message with several words to consume tokens' })
    cm.addMessage({ role: 'assistant', content: 'This is another long response that should push us over the limit' })
    expect(cm.getTokenCount()).toBeLessThanOrEqual(30)
  })
})
