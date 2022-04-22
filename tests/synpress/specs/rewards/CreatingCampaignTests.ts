import { MenuBar } from '../../../pages/MenuBar'
import { RewardsPage } from '../../../pages/RewardsPage'
import { CreatePoolPage } from '../../../pages/CreatePoolPage'
import { PairMenu } from '../../../pages/PairMenu'
import { TokenMenu } from '../../../pages/TokenMenu'
import { DateUtils } from '../../../utils/DateUtils'
import { SubgraphFacade } from '../../../utils/facades/SubgraphFacade'
import { AddressesEnum } from '../../../utils/enums/AddressesEnum'
import {getUnixTime} from "date-fns";

describe('Wallet connection tests', () => {
  const REWARDS_INPUT = 0.001
  const startsAt = DateUtils.getDateTimeAndAppendMinutes(2)
  const endsAt = DateUtils.getDateTimeAndAppendMinutes(4)

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
    cy.resetMetamaskAccount()
    cy.wait(500)
  })

  it('Should create a single reward pool', () => {
    RewardsPage.getCreateCampaignButton().click()
    CreatePoolPage.getLiquidityPairMenuButton().click()
    PairMenu.choosePair('DAI/USDT')
    CreatePoolPage.getRewardTokenMenuButton().click()
    TokenMenu.chooseToken('weenus')
    CreatePoolPage.getTotalRewardInput().type(String(REWARDS_INPUT))

    CreatePoolPage.setStartTime(DateUtils.getFormattedDateTime(startsAt))
    CreatePoolPage.setEndTime(DateUtils.getFormattedDateTime(endsAt))

    CreatePoolPage.confirmPoolCreation()
    cy.confirmMetamaskTransaction({})
    MenuBar.checkToastMessage('campaign')
    SubgraphFacade.liquidityCampaign(AddressesEnum.WALLET_PUBLIC, getUnixTime(startsAt)).then((res: any) => {
      expect(res.body.data.liquidityMiningCampaigns[0].owner).to.be.eq(AddressesEnum.WALLET_PUBLIC.toLowerCase())
      expect(parseInt(res.body.data.liquidityMiningCampaigns[0].endsAt)).to.be.eq(getUnixTime(endsAt))
      expect(parseFloat(res.body.data.liquidityMiningCampaigns[0].rewards[0].amount)).to.be.eq(REWARDS_INPUT)
      expect(res.body.data.liquidityMiningCampaigns[0].rewards[0].token.symbol).to.be.eq('WEENUS')
      expect(res.body.data.liquidityMiningCampaigns[0].stakablePair.token0.symbol).to.be.eq('DAI')
      expect(res.body.data.liquidityMiningCampaigns[0].stakablePair.token1.symbol).to.be.eq('USDT')
    })
  })
  it('Should open a campaign', () => {
    RewardsPage.getRewardCards().should("be.visible")
    RewardsPage.getRewardCardByStartingAt(getUnixTime(startsAt).toString()).should("be.visible")
    cy.wait(10000)
    RewardsPage.getRewardCardByStartingAt(getUnixTime(startsAt).toString()).click()
  })
})
