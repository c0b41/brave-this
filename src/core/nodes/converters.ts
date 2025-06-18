import constants from '../../utils/constants'

interface UnitConversionData {
  input: string
  output: string
  formula: string
}

interface CurrencyConversionData {
  input: {
    name: string
    value: string
  }
  output: {
    name: string
    value: string
  }
}

type ConversionData = UnitConversionData | CurrencyConversionData

export default class Converter {
  input: string | { name: string; value: string }
  output: string | { name: string; value: string }
  formula?: string

  constructor(private $: any, data: []) {
    let metadata = data[1].data.body.response

    console.log(metadata)
    const unitInput = $(constants.SELECTORS.UNIT_CONVERTER_INPUT).attr('value')?.trim()
    const unitOutput = $(constants.SELECTORS.UNIT_CONVERTER_OUTPUT).attr('value')?.trim()
    const unitFormula = $(constants.SELECTORS.UNIT_CONVERTER_FORMULA).text().trim()

    if (unitInput && unitOutput) {
      this.input = unitInput
      this.output = unitOutput
      this.formula = unitFormula || undefined
      return
    }

    // Try currency conversion fallback
    const currencyInputName = $(constants.SELECTORS.INPUT_CURRENCY_NAME).attr('data-name')?.trim()
    const currencyOutputName = $(constants.SELECTORS.OUTPUT_CURRENCY_NAME).attr('data-name')?.trim()
    const currencyInputValue = $(constants.SELECTORS.CURRENCY_CONVERTER_INPUT).text().trim()
    const currencyOutputValue = $(constants.SELECTORS.CURRENCY_CONVERTER_OUTPUT).text().trim()

    if (currencyInputValue && currencyOutputValue && currencyInputName && currencyOutputName) {
      this.input = {
        name: currencyInputName,
        value: currencyInputValue,
      }

      this.output = {
        name: currencyOutputName,
        value: currencyOutputValue,
      }
      return
    }

    // Fallback: empty or null values
    this.input = ''
    this.output = ''
  }
}
