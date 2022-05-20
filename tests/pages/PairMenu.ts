export class PairMenu {
  static getSearchPairInput() {
    return cy.get('[data-testid=search-pair]')
  }
  static choosePair(pairName: string) {
    return this.getSearchPairInput().type(pairName + '{enter}{enter}', { delay: 100 })
  }
}
