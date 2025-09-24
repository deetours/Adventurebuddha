describe('Trip Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('completes the full booking flow', () => {
    // Navigate to trips page
    cy.contains('Explore Trips').click()
    cy.url().should('include', '/trips')

    // Filter trips
    cy.get('[placeholder="Search trips by name, destination..."]').type('Ladakh')
    cy.wait(1000) // Wait for search debounce

    // Click on a trip
    cy.contains('Ladakh Adventure').click()
    cy.url().should('include', '/trips/ladakh-adventure')

    // Navigate to seat selection (would need trip details page implementation)
    // This is a placeholder for the full flow
    cy.contains('Book Now').should('be.visible')
  })

  it('handles search functionality', () => {
    cy.visit('/trips')
    
    // Test search
    cy.get('[placeholder="Search trips by name, destination..."]').type('Beach')
    cy.wait(1000)
    
    cy.get('.grid').should('contain', 'Beach')
  })

  it('filters trips by difficulty', () => {
    cy.visit('/trips')
    
    // Open mobile filter if on mobile
    cy.viewport(375, 667)
    cy.get('[data-testid="mobile-filter-button"]').click()
    
    // Select difficulty filter
    cy.contains('Difficulty').parent().find('select').select('easy')
    
    // Verify filtering works
    cy.get('[data-testid="trip-card"]').should('contain', 'easy')
  })
})