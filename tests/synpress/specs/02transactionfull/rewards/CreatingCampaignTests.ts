import { MenuBar } from '../../../../pages/MenuBar'
import { RewardsPage } from '../../../../pages/RewardsPage'
import { CreatePoolPage } from '../../../../pages/CreatePoolPage'
import { PairMenu } from '../../../../pages/PairMenu'
import { TokenMenu } from '../../../../pages/TokenMenu'
import { DateUtils } from '../../../../utils/DateUtils'
import { SubgraphFacade } from '../../../../utils/facades/SubgraphFacade'
import { AddressesEnum } from '../../../../utils/enums/AddressesEnum'
import { getUnixTime } from 'date-fns'
import { LiquidityPage } from '../../../../pages/LiquidityPage'
import { CampaignPage } from '../../../../pages/CampaignPage'
import { LiquidityCampaign } from '../../../../utils/TestTypes'
import { MetamaskNetworkHandler } from '../../../../utils/MetamaskNetworkHandler'

describe('Campaign creation tests', () => {
  const REWARDS_INPUT = 0.001
  const TOKENS_PAIR = 'DAI/USDT'
  const REWARD_TOKEN = 'weenus'
  const expectedStartsAt = DateUtils.getDateTimeAndAppendMinutes(2)
  const expectedEndsAt = DateUtils.getDateTimeAndAppendMinutes(4)
  let isCampaignCreated = false

  before(() => {
    MetamaskNetworkHandler.switchToRinkebyIfNotConnected()
  })
  beforeEach(() => {
    RewardsPage.visitRewardsPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearCookies()
    cy.clearLocalStorage()
  })
  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
    cy.wait(500)
  })

  it('Should create a single reward pool [TC-60]', () => {
    RewardsPage.getCreateCampaignButton().click({ scrollBehavior: 'top' })
    CreatePoolPage.selectLpTokenStaking()
    CreatePoolPage.getLiquidityPairMenuButton().click({ scrollBehavior: 'top' })
    PairMenu.choosePair(TOKENS_PAIR)

    CreatePoolPage.setStartTime(DateUtils.getFormattedDateTimeForInput(expectedStartsAt))
    CreatePoolPage.setEndTime(DateUtils.getFormattedDateTimeForInput(expectedEndsAt))

    CreatePoolPage.getRewardTokenMenuButton().first().click({ scrollBehavior: 'top' })
    TokenMenu.searchAndChooseToken(REWARD_TOKEN)
    CreatePoolPage.getTotalRewardInput().type(String(REWARDS_INPUT))

    CreatePoolPage.confirmPoolCreation()
    cy.confirmMetamaskTransaction({})

    cy.scrollTo('top')
    MenuBar.checkToastMessage('campaign')
    ;(
      SubgraphFacade.liquidityCampaign(AddressesEnum.WALLET_PUBLIC, getUnixTime(expectedStartsAt)) as Cypress.Chainable
    ).then((res: LiquidityCampaign) => {
      const firstLiquidityCampaign = res.body.data.liquidityMiningCampaigns[0]
      const {
        owner,
        rewards,
        endsAt,
        stakablePair: { token0, token1 },
      } = firstLiquidityCampaign

      expect(owner).to.be.eq(AddressesEnum.WALLET_PUBLIC.toLowerCase())
      expect(parseInt(endsAt)).to.be.eq(getUnixTime(expectedEndsAt))
      expect(parseFloat(rewards[0].amount)).to.be.eq(REWARDS_INPUT)
      expect(rewards[0].token.symbol).to.be.eq('WEENUS')
      expect(token0.symbol).to.be.eq('DAI')
      expect(token1.symbol).to.be.eq('USDT')
      isCampaignCreated = true
    })
  })
  it('Should open a campaign through liquidity pair [TC-60]', function () {
    if (!isCampaignCreated) {
      this.skip()
    }
    LiquidityPage.visitLiquidityPage()
    LiquidityPage.getAllPairsButton().click({})
    TokenMenu.getOpenTokenManagerButton().click({})
    TokenMenu.switchTokenList('compound')
    TokenMenu.goBack()
    TokenMenu.searchAndChooseToken('dai')
    LiquidityPage.getPairCards().contains('USDT').click({})
    RewardsPage.getRewardCardByStartingAt(getUnixTime(expectedStartsAt).toString()).click({})
    CampaignPage.checkCampaignData(
      TOKENS_PAIR,
      REWARDS_INPUT,
      'ACTIVE',
      DateUtils.getFormattedDateTimeForValidation(expectedStartsAt),
      DateUtils.getFormattedDateTimeForValidation(expectedEndsAt)
    )
  })
  // WILL BE FIXED IN #1364
  it.skip('Should open a campaign through Rewards page [TC-60]', function () {
    if (!isCampaignCreated) {
      this.skip()
    }
    RewardsPage.getRewardCards().should('be.visible')
    RewardsPage.getAllPairsButton().click({})
    PairMenu.choosePair(TOKENS_PAIR)
    RewardsPage.clickOnRewardCardUntilCampaignOpen(expectedStartsAt)
    CampaignPage.checkCampaignData(
      TOKENS_PAIR,
      REWARDS_INPUT,
      'ACTIVE',
      DateUtils.getFormattedDateTimeForValidation(expectedStartsAt),
      DateUtils.getFormattedDateTimeForValidation(expectedEndsAt)
    )
  })
})
