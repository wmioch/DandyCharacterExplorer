const Feedback = {
  init() {
    this.modal = document.getElementById('feedback-modal');
    this.openButton = document.getElementById('open-feedback-modal');
    this.closeButton = document.getElementById('close-feedback-modal');
    this.cancelButton = document.getElementById('cancel-feedback-modal');
    this.submitButton = document.getElementById('submit-feedback');
    this.textarea = document.getElementById('feedback-message');
    this.status = document.getElementById('feedback-status');

    if (!this.modal || !this.openButton || !this.submitButton || !this.textarea || !this.status) {
      return;
    }

    this.openButton.addEventListener('click', () => this.openModal());
    this.closeButton?.addEventListener('click', () => this.closeModal());
    this.cancelButton?.addEventListener('click', () => this.closeModal());
    this.submitButton.addEventListener('click', () => this.submit());

    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.modal.style.display === 'flex') {
        this.closeModal();
      }
    });

    this.syncConfigurationState();
  },

  getConfig() {
    const config = window.DandyFeedbackConfig || {};

    return {
      feedbackApiUrl: typeof config.feedbackApiUrl === 'string' ? config.feedbackApiUrl.trim() : '',
      appVersion: typeof config.appVersion === 'string' && config.appVersion.trim()
        ? config.appVersion.trim()
        : '1.0.0'
    };
  },

  syncConfigurationState() {
    const { feedbackApiUrl } = this.getConfig();
    const configured = feedbackApiUrl.length > 0;

    this.openButton.classList.toggle('feedback-btn-unconfigured', !configured);

    if (!configured) {
      this.setStatus(
        'Feedback is not configured yet. Add the deployed Azure Function URL in js/feedback-config.js.',
        'warning'
      );
    } else {
      this.clearStatus();
    }
  },

  openModal() {
    this.modal.style.display = 'flex';
    this.syncConfigurationState();
    this.textarea.focus();
  },

  closeModal() {
    this.modal.style.display = 'none';
    this.clearStatus();
  },

  setStatus(message, kind = 'info') {
    this.status.textContent = message;
    this.status.dataset.state = kind;
  },

  clearStatus() {
    this.status.textContent = '';
    this.status.dataset.state = 'idle';
  },

  collectContext() {
    const appState = window.App?.state || {};
    const selectedToon = appState.selectedToon?.name || 'None';
    const conditionalState = appState.selectedConditionalStat?.name || 'None';

    const trinkets = Array.isArray(appState.equippedTrinkets)
      ? appState.equippedTrinkets.map((entry) => {
          const trinket = entry?.trinket || entry;
          const count = entry?.count;

          if (!trinket?.name) {
            return null;
          }

          return count ? `${trinket.name} x${count}` : trinket.name;
        }).filter(Boolean)
      : [];

    const items = Array.isArray(appState.activeItems)
      ? appState.activeItems.map(({ item, count }) => item?.name ? `${item.name} x${count}` : null).filter(Boolean)
      : [];

    const teamMembers = Array.isArray(appState.teamMembers)
      ? appState.teamMembers.map((toon) => toon?.name || null).filter(Boolean)
      : [];

    const activeAbilities = Array.isArray(appState.activeAbilities)
      ? appState.activeAbilities.map((ability) => ability?.name || null).filter(Boolean)
      : [];

    return {
      currentUrl: window.location.href,
      selectedToon,
      conditionalState,
      trinkets,
      items,
      teamMembers,
      activeAbilities,
      userAgent: navigator.userAgent
    };
  },

  buildMessage(userMessage) {
    const context = this.collectContext();

    return [
      userMessage.trim(),
      '',
      '---',
      'Dandy context',
      `URL: ${context.currentUrl}`,
      `Selected toon: ${context.selectedToon}`,
      `Configuration: ${context.conditionalState}`,
      `Selected trinkets: ${context.trinkets.length > 0 ? context.trinkets.join(', ') : 'None'}`,
      `Selected items: ${context.items.length > 0 ? context.items.join(', ') : 'None'}`,
      `Team state: ${context.teamMembers.length > 0 ? context.teamMembers.join(', ') : 'None'}`,
      `Active team abilities: ${context.activeAbilities.length > 0 ? context.activeAbilities.join(', ') : 'None'}`,
      `Browser: ${context.userAgent}`
    ].join('\n');
  },

  buildPayload(userMessage) {
    const config = this.getConfig();

    return {
      submitted_at: new Date().toISOString(),
      feedback: {
        message: this.buildMessage(userMessage)
      },
      app: {
        name: 'Dandy Character Explorer',
        version: config.appVersion,
        platform: 'web'
      },
      ecg_case: null
    };
  },

  async submit() {
    const config = this.getConfig();
    const rawMessage = this.textarea.value.trim();

    if (!config.feedbackApiUrl) {
      this.setStatus(
        'Feedback is not configured yet. Add the deployed Azure Function URL in js/feedback-config.js.',
        'warning'
      );
      return;
    }

    if (!rawMessage) {
      this.setStatus('Enter a message before submitting feedback.', 'error');
      this.textarea.focus();
      return;
    }

    const originalButtonText = this.submitButton.textContent;
    this.submitButton.disabled = true;
    this.submitButton.textContent = 'Sending...';
    this.setStatus('Submitting feedback...', 'info');

    try {
      const response = await fetch(config.feedbackApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(this.buildPayload(rawMessage))
      });

      if (!response.ok) {
        throw new Error(`Feedback request failed with status ${response.status}.`);
      }

      this.textarea.value = '';
      this.setStatus('Feedback sent. Thank you.', 'success');
      if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
        UI.showToast('Feedback sent.');
      }
    } catch (error) {
      console.error('Feedback submission failed.', error);
      this.setStatus('Feedback could not be sent. Try again after the backend is configured.', 'error');
    } finally {
      this.submitButton.disabled = false;
      this.submitButton.textContent = originalButtonText;
    }
  }
};

window.Feedback = Feedback;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Feedback.init());
} else {
  Feedback.init();
}
