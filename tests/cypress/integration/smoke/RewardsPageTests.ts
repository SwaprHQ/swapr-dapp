import { RewardsPage } from '../../../pages/RewardsPage'
import { NetworkSwitcher } from '../../../pages/NetworkSwitcher'
import { MenuBar } from '../../../pages/MenuBar'

describe('Rewards Page Smoke Test', () => {
  before(() => {
    RewardsPage.visitRewardsPage()
  })
  it('Check My pairs toggle switch on Rewards Page', () => {
    RewardsPage.getMyPairsToggleSwitch().should('be.visible')
  })
  it('Check All pairs and search modal window on Rewards Page', () => {
    RewardsPage.getAllPairsButton().should('be.visible')
    RewardsPage.getAllPairsButton().click()
    RewardsPage.getSearchAPairModalWindow().should('be.visible')
    RewardsPage.getSearchAPairField().should('be.visible')
    RewardsPage.getCloseSearchAPairModalWindowButton().click()
  })
  it('Rewards list active/expired should be displayed on Gnosis Chain without connected wallet', () => {
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.gnosis().should('be.visible')
    NetworkSwitcher.gnosis().click()
    RewardsPage.getExpiredCampaignsButton().should('be.visible')
    RewardsPage.getExpiredCampaignsButton().click()
    RewardsPage.getRewardCards()
      .first()
      .should('be.visible')
    RewardsPage.getActiveCampaignsButton().should('be.visible')
    RewardsPage.getActiveCampaignsButton().click()
    RewardsPage.getRewardCards()
      .first()
      .should('be.visible')
  })
  it('Rewards list active/expired should be displayed on Arbitrum One without connected wallet', () => {
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.arbitrum().should('be.visible')
    NetworkSwitcher.arbitrum().click()
    RewardsPage.getExpiredCampaignsButton().should('be.visible')
    RewardsPage.getExpiredCampaignsButton().click()
    RewardsPage.getRewardCards()
      .first()
      .should('be.visible')
    RewardsPage.getActiveCampaignsButton().should('be.visible')
    RewardsPage.getActiveCampaignsButton().click()
    RewardsPage.getRewardCards()
      .first()
      .should('be.visible')
  })
  it('Rewards list active/expired should be displayed on Ethereum without connected wallet', () => {
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.ethereum().should('be.visible')
    NetworkSwitcher.ethereum().click()
    RewardsPage.getExpiredCampaignsButton().should('be.visible')
    RewardsPage.getExpiredCampaignsButton().click()
    RewardsPage.getRewardCards()
      .first()
      .should('be.visible')
    //TODO: When Active Reward cards exist then uncomment functions down below
    //RewardsPage.getActiveCampaignsButton().should('be.visible')
    //RewardsPage.getActiveCampaignsButton().click()
    //RewardsPage.getRewardCard().first().should('be.visible')
  })
  it('Create Campaign button should be displayed and have href to Create a liquidity mining pool page', () => {
    RewardsPage.getCreateCampaignButton()
      .should('have.attr', 'href')
      .and('include', '/liquidity-mining/create')
  })
})
