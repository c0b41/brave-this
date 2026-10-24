import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface UnitConversionData {
  amount: string
  from_unit: string
  to_unit: string
  formula: string
}

export interface CurrencyConversionData {
  input: { name: string; value: number }
  output: { name: string; value: number }
  amount: number
}

export type ConversionData = UnitConversionData | CurrencyConversionData | null

export function parse(_$: CheerioAPI, jsData: RootObject): ConversionData {
  const results = jsData.data.body.response.rich?.results ?? []

  const unitData = results.find((item) => item.subtype === 'unitconversion')
  if (unitData?.unitConversion) {
    return {
      amount: unitData.unitConversion.amount,
      from_unit: unitData.unitConversion.from_unit,
      to_unit: unitData.unitConversion.to_unit,
      formula: unitData.unitConversion.dimensionality,
    }
  }

  const currencyData = results.find((item) => item.subtype === 'currency')
  if (currencyData?.currency) {
    const q = currencyData.currency.conversion.query
    return {
      input: { name: q.from_currency.full_name, value: q.from_currency.decimals },
      output: { name: q.to_currency.full_name, value: q.to_currency.decimals },
      amount: currencyData.currency.conversion.amount,
    }
  }

  return null
}

export default { parse }
