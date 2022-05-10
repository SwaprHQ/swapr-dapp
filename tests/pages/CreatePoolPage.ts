export class CreatePoolPage {
  static getLiquidityPairMenuButton() {
    return cy.get('[data-testid=liquidity-pair-select]')
  }
  static getRewardTokenMenuButton() {
    return cy.get('[data-testid=reward-token-select]')
  }
  static getTotalRewardInput() {
    return cy.get('[data-testid=reward-input]')
  }
  static getConfirmButton() {
    return cy.get('[data-testid=confirm-button]')
  }
  static setStartTime(time: string) {
    return cy.get('[data-testid=start-time-selector-box]').within(() => {
      cy.get('.react-datepicker__input-container').type(time)
    })
  }
  static setEndTime(time: string) {
    return cy.get('[data-testid=end-time-selector-box]').within(() => {
      cy.get('.react-datepicker__input-container').type(time)
    })
  }
  static confirmPoolCreation() {
    this.getConfirmButton().click()
    cy.get('[data-testid=modal-confirm-button]').click()
  }
}
