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
