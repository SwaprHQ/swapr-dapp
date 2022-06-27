import { getUnixTime } from 'date-fns'

export class RewardsPage {
  static visitRewardsPage() {
    cy.visit('/#/rewards')
  }

  static getActiveCampaignsButton() {
    return cy.get('[data-testid=active-campaigns]')
  }

  static getExpiredCampaignsButton() {
    return cy.get('[data-testid=expired-campaigns]')
  }

  static getCreateCampaignButton() {
    return cy.get('[data-testid=create-campaign]')
  }

  static getAllPairsButton() {
    return cy.get('[data-testid=all-pairs]')
  }

  static getSearchAPairModalWindow() {
    return cy.get('[data-testid=select-a-pair]')
  }

  static getSearchAPairField() {
    return cy.get('[data-testid=search-pair]')
  }

  static getCloseSearchAPairModalWindowButton() {
    return cy.get('[data-testid=close-search-pair]')
  }

  static getMyPairsToggleSwitch() {
    return cy.get('.react-switch-button')
  }

  static getRewardCards() {
    return cy.get('[data-testid=reward-card]')
  }

  static getRewardInformationCard() {
    return cy.get('[data-testid=reward-campaign-information-card]')
  }

  static getRewardCardByStartingAt(startingAt: string) {
    return cy.get('[data-testid=reward-starting-at-' + startingAt + ']', { timeout: 60000 })
  }

  static clickOnRewardCardUntilCampaignOpen(startingAt: Date) {
    RewardsPage.getRewardCardByStartingAt(getUnixTime(startingAt).toString()).click()
  }
}
