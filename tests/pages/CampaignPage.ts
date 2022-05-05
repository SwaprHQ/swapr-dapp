export class CampaignPage {
  static getCampaignTokensText() {
    return cy.get('[data-testid=campaign-tokens]')
  }
  static getCampaignStatusText(specifiedTimout = 30000) {
    return cy.get('[data-testid=campaign-status]', { timeout: specifiedTimout })
  }
  static getCampaignStartDateText() {
    return cy.get('[data-testid=start-date]')
  }
  static getCampaignEndDateText() {
    return cy.get('[data-testid=end-date]')
  }
  static getCampaignRewardsBox() {
    return cy.get('[data-testid=rewards-box]')
  }
  static checkCampaignData(
    tokenPair: string,
    rewardsInput: number,
    campaignStatus: string,
    startsAt: string,
    endsAt: string
  ) {
    CampaignPage.getCampaignTokensText().should('contain.text', tokenPair)
    CampaignPage.getCampaignRewardsBox().should('contain.text', rewardsInput)
    CampaignPage.getCampaignStatusText(90000).should('contain.text', campaignStatus)
    CampaignPage.getCampaignStartDateText().should('contain.text', startsAt)
    CampaignPage.getCampaignEndDateText().should('contain.text', endsAt)
    return cy.get('[data-testid=rewards-box]')
  }
}
