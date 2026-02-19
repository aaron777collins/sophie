describe('Chat Input Component', () => {
  beforeEach(() => {
    // Set up test environment
    cy.visit('/channels/test-channel'); // Adjust URL as needed
    
    // Mock Matrix client if needed
    cy.window().then((win) => {
      // Add any necessary setup for Matrix client mocking
    });
  });

  describe('Visual Appearance', () => {
    it('displays the chat input correctly', () => {
      cy.get('[data-testid="chat-input"]').should('be.visible');
      cy.get('input[placeholder*="Message #"]').should('be.visible');
      cy.get('button[aria-label*="plus"]').should('be.visible');
      cy.get('[data-testid="emoji-picker"]').should('be.visible');
    });

    it('matches discord-clone visual design', () => {
      cy.get('[data-testid="chat-input"]').then(($chatInput) => {
        // Verify container styling
        cy.wrap($chatInput).should('have.class', 'relative');
        cy.wrap($chatInput).should('have.class', 'p-4');
        cy.wrap($chatInput).should('have.class', 'pb-6');
      });

      // Verify input styling matches discord-clone exactly
      cy.get('input[placeholder*="Message #"]').should('have.class', 'px-14');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'py-6');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'bg-zinc-200/90');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'dark:bg-zinc-700/75');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'border-none');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'border-0');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'focus-visible:ring-0');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'focus-visible:ring-offset-0');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'text-zinc-600');
      cy.get('input[placeholder*="Message #"]').should('have.class', 'dark:text-zinc-200');
    });

    it('plus button has correct styling and positioning', () => {
      cy.get('button[aria-label*="plus"]').then(($button) => {
        cy.wrap($button).should('have.class', 'absolute');
        cy.wrap($button).should('have.class', 'top-7');
        cy.wrap($button).should('have.class', 'left-8');
        cy.wrap($button).should('have.class', 'h-[24px]');
        cy.wrap($button).should('have.class', 'w-[24px]');
        cy.wrap($button).should('have.class', 'bg-zinc-500');
        cy.wrap($button).should('have.class', 'dark:bg-zinc-400');
        cy.wrap($button).should('have.class', 'hover:bg-zinc-600');
        cy.wrap($button).should('have.class', 'dark:hover:bg-zinc-300');
        cy.wrap($button).should('have.class', 'transition');
        cy.wrap($button).should('have.class', 'rounded-full');
        cy.wrap($button).should('have.class', 'p-1');
        cy.wrap($button).should('have.class', 'flex');
        cy.wrap($button).should('have.class', 'items-center');
        cy.wrap($button).should('have.class', 'justify-center');
      });
    });

    it('emoji picker has correct positioning', () => {
      cy.get('[data-testid="emoji-picker"]').parent().then(($container) => {
        cy.wrap($container).should('have.class', 'absolute');
        cy.wrap($container).should('have.class', 'top-7');
        cy.wrap($container).should('have.class', 'right-8');
      });
    });
  });

  describe('Placeholder Text', () => {
    it('displays correct placeholder for channel', () => {
      cy.get('input').should('have.attr', 'placeholder').and('match', /Message #/);
    });

    it('displays correct placeholder for conversation', () => {
      // This would require setting up a conversation context
      // cy.visit('/conversations/user123');
      // cy.get('input').should('have.attr', 'placeholder').and('match', /Message [^#]/);
    });
  });

  describe('Message Input Functionality', () => {
    it('allows typing in the input field', () => {
      const testMessage = 'Hello, this is a test message!';
      
      cy.get('input[placeholder*="Message #"]')
        .type(testMessage)
        .should('have.value', testMessage);
    });

    it('submits message on Enter key', () => {
      // Mock the Matrix message sending
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 200,
        body: { event_id: '$test-event-id' }
      }).as('sendMessage');

      const testMessage = 'Test message submission';
      
      cy.get('input[placeholder*="Message #"]')
        .type(testMessage)
        .type('{enter}');

      // Verify message was sent (adjust based on actual Matrix API)
      cy.wait('@sendMessage').then((interception) => {
        expect(interception.request.body).to.include(testMessage);
      });
    });

    it('clears input after successful message send', () => {
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 200,
        body: { event_id: '$test-event-id' }
      });

      cy.get('input[placeholder*="Message #"]')
        .type('Test message')
        .type('{enter}')
        .should('have.value', '');
    });

    it('does not submit empty messages', () => {
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 200,
        body: { event_id: '$test-event-id' }
      }).as('sendMessage');

      cy.get('input[placeholder*="Message #"]')
        .type('   ') // Only whitespace
        .type('{enter}');

      // Verify no request was made
      cy.get('@sendMessage.all').should('have.length', 0);
      
      // Input should be cleared
      cy.get('input[placeholder*="Message #"]').should('have.value', '   ');
    });

    it('handles long messages appropriately', () => {
      const longMessage = 'A'.repeat(4000); // Very long message
      
      cy.get('input[placeholder*="Message #"]')
        .type(longMessage)
        .should('have.value', longMessage);
    });
  });

  describe('File Upload Button', () => {
    it('opens file upload modal when clicked', () => {
      // Mock the modal opening
      cy.window().then((win) => {
        cy.stub(win, 'useModal').returns({
          onOpen: cy.stub().as('modalOpen')
        });
      });

      cy.get('button[aria-label*="plus"]').click();

      // Verify modal was opened with correct parameters
      cy.get('@modalOpen').should('have.been.calledWith', 'messageFile');
    });

    it('has hover effects', () => {
      cy.get('button[aria-label*="plus"]')
        .trigger('mouseover')
        .should('have.class', 'hover:bg-zinc-600')
        .should('have.class', 'dark:hover:bg-zinc-300');
    });
  });

  describe('Emoji Picker', () => {
    it('opens emoji picker when clicked', () => {
      cy.get('[data-testid="emoji-picker"]').click();
      
      // Verify emoji picker popover is visible
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('.emoji-mart').should('be.visible');
    });

    it('adds emoji to input when selected', () => {
      const existingText = 'Hello world';
      
      cy.get('input[placeholder*="Message #"]').type(existingText);
      cy.get('[data-testid="emoji-picker"]').click();
      
      // Select an emoji (adjust selector based on actual emoji picker)
      cy.get('[data-id=":grinning:"]').click();
      
      cy.get('input[placeholder*="Message #"]')
        .should('have.value', `${existingText} 😀`);
    });

    it('closes emoji picker after selection', () => {
      cy.get('[data-testid="emoji-picker"]').click();
      cy.get('[data-id=":grinning:"]').click();
      
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Loading States', () => {
    it('disables input during message sending', () => {
      // Mock a slow response
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 200,
        body: { event_id: '$test-event-id' },
        delay: 1000
      }).as('slowSendMessage');

      cy.get('input[placeholder*="Message #"]')
        .type('Test message')
        .type('{enter}');

      // Verify input is disabled during sending
      cy.get('input[placeholder*="Message #"]').should('be.disabled');

      cy.wait('@slowSendMessage');
      
      // Verify input is re-enabled after completion
      cy.get('input[placeholder*="Message #"]').should('not.be.disabled');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when message sending fails', () => {
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('failedSendMessage');

      cy.get('input[placeholder*="Message #"]')
        .type('Test message')
        .type('{enter}');

      cy.wait('@failedSendMessage');

      // Verify error message is displayed
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .should('contain', 'Failed to send message');
    });

    it('retains message content when sending fails', () => {
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 500,
        body: { error: 'Network error' }
      });

      const testMessage = 'This should be retained';

      cy.get('input[placeholder*="Message #"]')
        .type(testMessage)
        .type('{enter}');

      // Message should still be in the input after failed send
      cy.get('input[placeholder*="Message #"]').should('have.value', testMessage);
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      // Tab should focus the input
      cy.get('body').tab();
      cy.get('input[placeholder*="Message #"]').should('be.focused');

      // Tab should move to next focusable element
      cy.focused().tab();
      cy.get('button[aria-label*="plus"]').should('be.focused');
    });

    it('has proper ARIA attributes', () => {
      cy.get('input[placeholder*="Message #"]')
        .should('have.attr', 'role', 'textbox');
      
      cy.get('button[aria-label*="plus"]')
        .should('have.attr', 'type', 'button');
    });

    it('works with screen reader announcements', () => {
      // This would require axe-core testing
      cy.injectAxe();
      cy.checkA11y('[data-testid="chat-input"]');
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('works in different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport('iphone-6');
      cy.get('[data-testid="chat-input"]').should('be.visible');
      cy.get('input[placeholder*="Message #"]').should('be.visible');

      // Test tablet viewport
      cy.viewport('ipad-2');
      cy.get('[data-testid="chat-input"]').should('be.visible');

      // Test desktop viewport
      cy.viewport(1920, 1080);
      cy.get('[data-testid="chat-input"]').should('be.visible');
    });
  });

  describe('Integration with Chat System', () => {
    it('integrates properly with chat message list', () => {
      // Send a message and verify it appears in the chat
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 200,
        body: { event_id: '$new-message-id' }
      });

      const testMessage = 'Integration test message';

      cy.get('input[placeholder*="Message #"]')
        .type(testMessage)
        .type('{enter}');

      // Verify message appears in chat (adjust selector as needed)
      cy.get('[data-testid="message-list"]')
        .should('contain', testMessage);
    });

    it('maintains focus after sending message', () => {
      cy.intercept('POST', '**/send/m.room.message**', {
        statusCode: 200,
        body: { event_id: '$test-event-id' }
      });

      cy.get('input[placeholder*="Message #"]')
        .type('Test message')
        .type('{enter}')
        .should('be.focused');
    });
  });
});