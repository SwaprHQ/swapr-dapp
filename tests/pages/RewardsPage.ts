import { getUnixTime } from 'date-fns'
import { PairMenu } from './PairMenu'

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

  static getRewardCardByStartingAt(startingAt: string) {
    return cy.get('[data-testid=reward-starting-at-' + startingAt + ']', { timeout: 60000 })
  }

  static clickOnRewardCardUntilCampaignOpen(startingAt: Date, chosenPair = '') {
    cy.waitUntil(() => {
      if (Cypress.$('[data-testid=reward-card]').length) {
        //TODO After opening campaign for first time it instead of opening reward card opens all rewards page
        if (chosenPair != '') {
          RewardsPage.getAllPairsButton().click()
          PairMenu.choosePair(chosenPair)
        }
        return RewardsPage.getRewardCardByStartingAt(getUnixTime(startingAt).toString())
          .click()
          .then(() => false)
      }
      return true
    })
  }
}
