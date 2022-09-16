export class PercentualDifference {
  private firstValue: number
  private lastValue: number
  private theme: { green1: string; red1: string; gray1: string }

  constructor(firstValue: number, lastValue: number, theme: { green1: string; red1: string; gray1: string }) {
    this.firstValue = firstValue
    this.lastValue = lastValue
    this.theme = theme
  }

  difference() {
    return parseFloat((((this.lastValue - this.firstValue) / this.firstValue) * 100).toPrecision(3))
  }

  isPositive() {
    return this.difference() > 0
  }

  isZero() {
    return this.difference() === 0
  }

  color() {
    if (this.isZero()) return this.theme.gray1

    return this.isPositive() ? this.theme.green1 : this.theme.red1
  }

  sign() {
    if (this.isZero()) return ''

    return this.isPositive() ? '+' : '-'
  }

  format() {
    return `${this.sign()}${Math.abs(this.difference())}%`
  }
}
