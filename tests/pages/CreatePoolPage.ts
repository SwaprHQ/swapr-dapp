export class CreatePoolPage {
  static getLiquidityPairMenuButton() {
    return cy.get('[data-testid=pair-asset-selector]')
  }
  static getLiquidityTokenMenuButton() {
    return cy.get('[data-testid=token-asset-selector]')
  }
  static getRewardTokenMenuButton() {
    return cy.get('[data-testid=token-reward-asset-selector]')
  }
  static getTotalRewardInput() {
    return cy.get('[data-testid=reward-input]')
  }
  static getConfirmButton() {
    return cy.get('[data-testid=confirm-button]')
  }
  static setStartTime(time: string) {
    return cy.get('[data-testid=starting-time-selector-box]').within(() => {
      cy.get('.react-datepicker__input-container').type(time)
    })
  }
  static setEndTime(time: string) {
    return cy.get('[data-testid=ending-time-selector-box]').within(() => {
      cy.get('.react-datepicker__input-container').type(time)
    })
  }
  static confirmPoolCreation() {
    this.getConfirmButton().click()
    cy.get('[data-testid=modal-confirm-button]').click()
  }
  static selectLpTokenStaking() {
    cy.get('[data-testid=lp-token-staking-switch]').click()
  }
  static selectSingleTokenStaking() {
    cy.get('[data-testid=single-token-staking-switch]').click()
  }
}
