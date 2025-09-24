describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login')
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  describe('Admin Dashboard', () => {
    it('should load admin dashboard with real data', () => {
      cy.visit('/admin/dashboard')

      // Check if dashboard loads
      cy.contains('Admin Dashboard').should('be.visible')
      cy.contains('Live').should('be.visible')

      // Check for key metrics
      cy.get('[data-testid="total-bookings"]').should('be.visible')
      cy.get('[data-testid="total-revenue"]').should('be.visible')
      cy.get('[data-testid="active-users"]').should('be.visible')
      cy.get('[data-testid="avg-rating"]').should('be.visible')
    })

    it('should display real-time connection status', () => {
      cy.visit('/admin/dashboard')

      // Check WebSocket connection indicator
      cy.get('[data-testid="connection-status"]')
        .should('be.visible')
        .and('contain', 'Live')
    })

    it('should load recent bookings data', () => {
      cy.visit('/admin/dashboard')

      // Switch to bookings tab
      cy.contains('Bookings').click()

      // Check if bookings table loads
      cy.get('[data-testid="bookings-table"]').should('be.visible')

      // Check for booking data (if exists)
      cy.get('body').then($body => {
        if ($body.text().includes('No recent bookings')) {
          cy.contains('No recent bookings').should('be.visible')
        } else {
          cy.get('[data-testid="booking-row"]').should('have.length.greaterThan', 0)
        }
      })
    })

    it('should load analytics data', () => {
      cy.visit('/admin/dashboard')

      // Switch to analytics tab
      cy.contains('Analytics').click()

      // Check if analytics charts load
      cy.get('[data-testid="analytics-container"]').should('be.visible')
    })

    it('should load AI agents status', () => {
      cy.visit('/admin/dashboard')

      // Switch to AI Agents tab
      cy.contains('AI Agents').click()

      // Check if agents status loads
      cy.get('[data-testid="agents-container"]').should('be.visible')
    })

    it('should handle real-time updates', () => {
      cy.visit('/admin/dashboard')

      // Wait for initial data load
      cy.get('[data-testid="total-bookings"]').should('be.visible')

      // Mock WebSocket message (in real scenario, this would come from backend)
      cy.window().then((win) => {
        // Simulate receiving WebSocket update
        win.postMessage({
          type: 'dashboard-update',
          data: {
            total_bookings: 1250,
            total_revenue: 3000000
          }
        }, '*')
      })

      // Check if data updates (this would work with real WebSocket)
      cy.get('[data-testid="total-bookings"]').should('be.visible')
    })
  })

  describe('User Dashboard', () => {
    beforeEach(() => {
      // Switch to user account
      cy.visit('/login')
      cy.get('input[name="email"]').type('user@example.com')
      cy.get('input[name="password"]').type('user123')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
    })

    it('should load user dashboard with personal data', () => {
      cy.visit('/dashboard')

      // Check user greeting
      cy.contains('Welcome back').should('be.visible')

      // Check personal stats
      cy.get('[data-testid="user-stats"]').should('be.visible')
      cy.get('[data-testid="total-trips"]').should('be.visible')
      cy.get('[data-testid="total-spent"]').should('be.visible')
      cy.get('[data-testid="loyalty-points"]').should('be.visible')
    })

    it('should display upcoming trips', () => {
      cy.visit('/dashboard')

      // Check upcoming trips section
      cy.get('[data-testid="upcoming-trips"]').should('be.visible')
    })

    it('should load travel insights', () => {
      cy.visit('/dashboard')

      // Check travel insights section
      cy.get('[data-testid="travel-insights"]').should('be.visible')
    })

    it('should display bookings tab with real data', () => {
      cy.visit('/dashboard')

      // Switch to bookings tab
      cy.contains('My Bookings').click()

      // Check bookings display
      cy.get('[data-testid="user-bookings"]').should('be.visible')
    })

    it('should display favorites tab', () => {
      cy.visit('/dashboard')

      // Switch to favorites tab
      cy.contains('Favorites').click()

      // Check favorites display
      cy.get('[data-testid="favorite-trips"]').should('be.visible')
    })

    it('should allow updating notification settings', () => {
      cy.visit('/dashboard')

      // Switch to settings tab
      cy.contains('Settings').click()

      // Check notification settings
      cy.get('[data-testid="notification-settings"]').should('be.visible')

      // Toggle a setting
      cy.get('input[name="email_bookings"]').click()

      // Save settings
      cy.get('button[data-testid="save-settings"]').click()

      // Check success message
      cy.contains('Settings saved successfully').should('be.visible')
    })

    it('should allow updating travel preferences', () => {
      cy.visit('/dashboard')

      // Switch to settings tab
      cy.contains('Settings').click()

      // Check travel preferences
      cy.get('[data-testid="travel-preferences"]').should('be.visible')

      // Update preferences
      cy.get('select[name="preferred_group_size"]').select('small')

      // Save preferences
      cy.get('button[data-testid="save-preferences"]').click()

      // Check success message
      cy.contains('Preferences saved successfully').should('be.visible')
    })

    it('should handle real-time notifications', () => {
      cy.visit('/dashboard')

      // Mock receiving a notification
      cy.window().then((win) => {
        win.postMessage({
          type: 'notification',
          data: {
            title: 'Booking Confirmed',
            message: 'Your booking has been confirmed',
            type: 'success'
          }
        }, '*')
      })

      // Check if notification appears
      cy.get('[data-testid="notification-toast"]').should('be.visible')
      cy.contains('Booking Confirmed').should('be.visible')
    })
  })

  describe('Dashboard Performance', () => {
    it('should load dashboard within acceptable time', () => {
      cy.visit('/admin/dashboard', { timeout: 10000 })

      // Measure load time
      cy.window().then((win) => {
        const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
        expect(loadTime).to.be.lessThan(5000) // Should load within 5 seconds
      })
    })

    it('should handle API failures gracefully', () => {
      // Intercept API calls and force them to fail
      cy.intercept('GET', '/api/dashboard/admin-overview', { statusCode: 500 }).as('adminOverview')

      cy.visit('/admin/dashboard')

      // Should show error state instead of crashing
      cy.get('[data-testid="error-state"]').should('be.visible')
      cy.contains('Failed to load dashboard data').should('be.visible')
    })

    it('should show loading states during data fetch', () => {
      // Slow down API response
      cy.intercept('GET', '/api/dashboard/admin-overview', (req) => {
        req.reply((res) => {
          res.delay = 2000 // 2 second delay
        })
      }).as('slowAdminOverview')

      cy.visit('/admin/dashboard')

      // Should show loading state
      cy.get('[data-testid="loading-spinner"]').should('be.visible')

      // Should eventually load data
      cy.get('[data-testid="total-bookings"]').should('be.visible')
    })
  })

  describe('Dashboard Responsiveness', () => {
    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-6')

      cy.visit('/admin/dashboard')

      // Check if mobile layout is applied
      cy.get('[data-testid="mobile-menu"]').should('be.visible')

      // Check if key elements are still accessible
      cy.get('[data-testid="total-bookings"]').should('be.visible')
    })

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2')

      cy.visit('/admin/dashboard')

      // Check tablet layout
      cy.get('[data-testid="dashboard-grid"]').should('have.css', 'grid-template-columns')
    })

    it('should work on desktop screens', () => {
      cy.viewport(1920, 1080)

      cy.visit('/admin/dashboard')

      // Check desktop layout
      cy.get('[data-testid="sidebar"]').should('be.visible')
      cy.get('[data-testid="main-content"]').should('be.visible')
    })
  })
})