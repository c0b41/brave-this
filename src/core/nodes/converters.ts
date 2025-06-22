import { RootObject } from '#utils/brave'

interface UnitConversionData {
  amount: string
  from_unit: string
  to_unit: string
  formula: string
}

interface CurrencyConversionData {
  input: {
    name: string
    value: number
  }
  output: {
    name: string
    value: number
  }
  amount: number
}

type ConversionData = UnitConversionData | CurrencyConversionData | null

export default class Converter {
  /**
   * Parses top stories from HTML
   */
  static parse($: any, jsData: RootObject): ConversionData {
    let unitData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'unitconversion')

    if (unitData && unitData.unitConversion) {
      return {
        amount: unitData.unitConversion.amount,
        from_unit: unitData.unitConversion.from_unit,
        to_unit: unitData.unitConversion.to_unit,
        formula: unitData.unitConversion.dimensionality,
      }
    }

    let currencytData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'currency')

    if (currencytData && currencytData.currency) {
      return {
        input: {
          name: currencytData.currency.conversion.query.from_currency.full_name,
          value: currencytData.currency.conversion.query.from_currency.decimals,
        },
        output: {
          name: currencytData.currency.conversion.query.to_currency.full_name,
          value: currencytData.currency.conversion.query.to_currency.decimals,
        },
        amount: currencytData.currency.conversion.amount,
      }
    }

    return null
  }
}
