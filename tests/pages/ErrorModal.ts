export class ErrorModal {
  static getTransactionErrorModal() {
    return cy.get('[data-testid=transaction-error-modal]')
  }
  static closeTransactionErrorModal() {
    return this.getTransactionErrorModal().within(() => {
      cy.get('[data-testid=close-icon]').click()
    })
  }
}
