import { describe, expect, it } from 'vitest'
import { buildLandingNewSchema } from '~/lib-modules/landing-new'

describe('buildLandingNewSchema', () => {
  const schema = buildLandingNewSchema('https://writelo.io/')

  it('returns Schema.org @graph payload', () => {
    expect(schema['@context']).toBe('https://schema.org')
    expect(Array.isArray(schema['@graph'])).toBe(true)
  })

  it('contains all four required entities', () => {
    const types = schema['@graph'].map(node => node['@type'])
    expect(types).toEqual(
      expect.arrayContaining(['WebSite', 'Organization', 'SoftwareApplication', 'FAQPage']),
    )
    expect(schema['@graph']).toHaveLength(4)
  })

  it('uses given canonical url for SoftwareApplication.url', () => {
    const ru = buildLandingNewSchema('https://writelo.io/ru')
    const software = ru['@graph'].find(n => n['@type'] === 'SoftwareApplication')
    expect(software?.url).toBe('https://writelo.io/ru')
  })

  it('SoftwareApplication has Free and Pro offers in RUB', () => {
    const software = schema['@graph'].find(n => n['@type'] === 'SoftwareApplication')
    expect(software?.applicationCategory).toBe('BusinessApplication')
    expect(software?.operatingSystem).toBe('Web')
    const offerNames = software?.offers.map((o: { name: string }) => o.name)
    expect(offerNames).toEqual(['Free', 'Pro'])
    const pro = software?.offers.find((o: { name: string }) => o.name === 'Pro')
    expect(pro?.price).toBe('990')
    expect(pro?.priceCurrency).toBe('RUB')
  })

  it('FAQPage exposes 5 questions', () => {
    const faq = schema['@graph'].find(n => n['@type'] === 'FAQPage')
    expect(faq?.mainEntity).toHaveLength(5)
    for (const q of faq?.mainEntity ?? []) {
      expect(q['@type']).toBe('Question')
      expect(q.name).toBeTruthy()
      expect(q.acceptedAnswer?.text).toBeTruthy()
    }
  })

  it('WebSite declares ru-RU locale', () => {
    const site = schema['@graph'].find(n => n['@type'] === 'WebSite')
    expect(site?.inLanguage).toBe('ru-RU')
    expect(site?.potentialAction).toBeUndefined()
  })

  it('graph is JSON-serializable for <script type="application/ld+json">', () => {
    expect(() => JSON.stringify(schema)).not.toThrow()
    expect(JSON.parse(JSON.stringify(schema))).toEqual(schema)
  })
})
