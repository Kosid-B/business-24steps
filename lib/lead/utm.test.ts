import { describe, it, expect } from 'vitest'
import { readUtmFrom } from './utm'

const SITE = 'https://app.test'

describe('readUtmFrom', () => {
  it('มี UTM บนหน้านี้ → ใช้ของหน้านี้', () => {
    const u = readUtmFrom('?utm_source=line&seg=founder', '', SITE)
    expect(u.utm_source).toBe('line')
    expect(u.seg).toBe('founder')
  })

  it('⭐ หน้านี้ไม่มี UTM แต่มาจาก /login ของเราที่มี UTM → ต้องไม่ทิ้งที่มา', () => {
    // เคสจริงที่เจอตอนทดสอบด้วยเบราว์เซอร์: กดโฆษณามาลง /login แล้วกดต่อมา /quickcheck
    const u = readUtmFrom('', `${SITE}/login?utm_source=facebook&utm_medium=social&utm_campaign=t1&seg=founder`, SITE)
    expect(u.utm_source).toBe('facebook')
    expect(u.utm_medium).toBe('social')
    expect(u.utm_campaign).toBe('t1')
    expect(u.seg).toBe('founder')
  })

  it('referrer เป็นเว็บอื่น → ไม่เอา query string ของเขามาใช้', () => {
    const u = readUtmFrom('', 'https://evil.test/?utm_source=ของปลอม&seg=ยัดมา', SITE)
    expect(u.utm_source).toBeUndefined()
    expect(u.seg).toBeUndefined()
    expect(u.referrer).toBe('https://evil.test/?utm_source=ของปลอม&seg=ยัดมา') // ยังเก็บไว้เป็นข้อมูลดิบ
  })

  it('หน้านี้มี UTM อยู่แล้ว → referrer ไม่มาทับ', () => {
    const u = readUtmFrom('?utm_source=line', `${SITE}/login?utm_source=facebook`, SITE)
    expect(u.utm_source).toBe('line')
  })

  it('ไม่มีอะไรเลย → ว่าง ไม่ล้ม', () => {
    expect(readUtmFrom('', '', SITE)).toEqual({ referrer: undefined })
  })

  it('referrer พัง → ไม่ล้ม', () => {
    expect(() => readUtmFrom('', 'ไม่ใช่ url', SITE)).not.toThrow()
  })

  it('ค่าว่างไม่นับเป็น UTM', () => {
    expect(readUtmFrom('?utm_source=&seg=', '', SITE).utm_source).toBeUndefined()
  })
})
