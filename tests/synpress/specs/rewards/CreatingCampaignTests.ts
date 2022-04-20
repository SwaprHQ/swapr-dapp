import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import {RewardsPage} from "../../../pages/RewardsPage";
import {CreatePoolPage} from "../../../pages/CreatePoolPage";
import {PairMenu} from "../../../pages/PairMenu";
import {TokenMenu} from "../../../pages/TokenMenu";

describe('Wallet connection tests', () => {
    beforeEach(() => {
        RewardsPage.visitRewardsPage()
        MenuBar.connectWallet()
    })
    afterEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps()
        cy.clearCookies()
        cy.clearLocalStorage()
    })

    it('Should create a single reward pool', () => {
        RewardsPage.getCreateCampaignButton().click()
        CreatePoolPage.getLiquidityPairMenuButton().click()
        PairMenu.choosePair("DAI/USDT")
        CreatePoolPage.getRewardTokenMenuButton().click()
        TokenMenu.chooseToken("dxd")
        CreatePoolPage.getTotalRewardInput().type("0.001")
        CreatePoolPage.setStartTime("20-04-2022 13:00")

        CreatePoolPage.setEndTime("20-04-2022 13:10")
        const d = new Date()
        console.log(d.getDay() + "-" + d.get)
        cy.wait(1000000)
    })
})
