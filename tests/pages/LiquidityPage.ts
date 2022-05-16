export class LiquidityPage {
  static visitLiquidityPage() {
    cy.visit('/#/pools')
  }
  static getAllPairsButton() {
    return cy.get('[data-testid=all-token-list]')
  }
  static getCreatePairButton() {
    return cy.get('[data-testid=create-pair]')
  }
  static getCampaignsAndMyPairsToggleSwitch() {
    return cy.get('[data-testid=campaigns-toggle]')
  }
  static typeValueToFirstToken(value: string) {
    this.getFirstTokenField().type(value)
    return this
  }
  static getFirstTokenField() {
    return cy.get('[data-testid=transaction-value-input]').first()
  }
  static getSecondTokenField() {
    return cy.get('[data-testid=transaction-value-input]').last()
  }
  static getInputFields() {
    return cy.get('[data-testid=transaction-value-input]')
  }
  static getSelectTokenButton() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getCreateAPairInputField() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getTokenSearchField() {
    return cy.get('[id=token-search-input]')
  }
  static getAddLiquidityButton() {
    return cy.get('[data-testid=add-liquidity]')
  }
  static getRemoveLiquidityButton() {
    return cy.get('[data-testid=remove-liquidity]')
  }
  static getRemove25PercentLiquidityButton() {
    return cy.get('[data-testid=remove-25]')
  }
  static getRemove50PercentLiquidityButton() {
    return cy.get('[data-testid=remove-50]')
  }
  static getRemove75PercentLiquidityButton() {
    return cy.get('[data-testid=remove-75]')
  }
  static getRemoveMaxLiquidityButton() {
    return cy.get('[data-testid=remove-max]')
  }
  static getFirstTokenAmountToRemove() {
    return cy.get('[data-testid=first-token-amount-to-remove]')
  }
  static getSecondTokenAmountToRemove() {
    return cy.get('[data-testid=second-token-amount-to-remove]')
  }
  static getYourPoolTokens() {
    return cy.get('[data-testid=user-pool-balance]')
  }
  static getFirstTokenBalance() {
    return cy.get('[data-testid=first-token-balance]')
  }
  static getSecondTokenBalance() {
    return cy.get('[data-testid=second-token-balance]')
  }
  static getUsersPoolShare() {
    return cy.get('[data-testid=pool-share]')
  }
  static getSupplyButton() {
    return cy.get('[data-testid=supply-button]')
  }
  static getConfirmSupplyButton() {
    return cy.get('[data-testid=confirm-supply]')
  }
  static getCloseTransactionSubmittedWindowButton() {
    return cy.get('[data-testid=close-modal-button]')
  }
  static getPairCards() {
    return cy.get('[data-testid=pair-card]')
  }
  static getRewardsCampaignButton() {
    return cy.get('#rewards-campaign-for-pair')
  }
  static switchCampaignsToogle() {
    LiquidityPage.getCampaignsAndMyPairsToggleSwitch().within(() => {
      return cy
        .get('label')
        .first()
        .click()
    })
  }
}
