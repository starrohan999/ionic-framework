describe('avatar: standalone', () => {
  beforeEach(() => {
    cy.visit('components/avatar/test/standalone?ionic:_testing=true');
  })

  it('should render', () => {
    cy.get('ion-avatar').should('have.class', 'hydrated');

    // cy.screenshot();
  });
});
