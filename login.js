/**
 * login.js – Acme School
 * Defines the <acme-login-form> Web Component and wires up the login flow.
 */

import { isValidEmailFormat, isFreeEmailDomain, attemptLogin, getSession } from './auth.js';

// ── Redirect if already logged in ───────────────────────────
if (getSession()) {
  window.location.href = 'examenes.html';
}

// ── Web Component ────────────────────────────────────────────
class AcmeLoginForm extends HTMLElement {
  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  render() {
    this.innerHTML = `
      <div class="login-card">
        <h2 class="login-card__title">Iniciar sesión</h2>

        <div class="login-card__group">
          <label class="login-card__label" for="lf-email">Email</label>
          <input
            class="login-card__input"
            id="lf-email"
            type="email"
            placeholder="admin@acme.edu"
            autocomplete="email"
            inputmode="email"
          />
          <span class="login-card__error-msg" id="lf-email-err" role="alert"></span>
        </div>

        <div class="login-card__group">
          <label class="login-card__label" for="lf-pass">Contraseña</label>
          <input
            class="login-card__input"
            id="lf-pass"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <span class="login-card__error-msg" id="lf-pass-err" role="alert"></span>
        </div>

        <p class="login-card__hint" id="lf-demo-hint">
          Usuario demo: admin@acme.edu / Admin123
        </p>

        <button class="login-card__btn" id="lf-submit" type="button">
          <span class="btn-label">⮕ Entrar</span>
          <span class="spinner" aria-hidden="true"></span>
        </button>
      </div>
    `;
  }

  _bindEvents() {
    const emailInput = this.querySelector('#lf-email');
    const passInput  = this.querySelector('#lf-pass');
    const submitBtn  = this.querySelector('#lf-submit');

    // Live email validation
    emailInput.addEventListener('input', () => this._validateEmail(emailInput));
    emailInput.addEventListener('blur',  () => this._validateEmail(emailInput));
    passInput.addEventListener('input',  () => this._clearError('lf-pass-err', passInput));

    // Enter key support
    [emailInput, passInput].forEach(el =>
      el.addEventListener('keydown', e => { if (e.key === 'Enter') this._handleSubmit(); })
    );

    submitBtn.addEventListener('click', () => this._handleSubmit());
  }

  _validateEmail(input) {
    const val = input.value.trim();
    if (!val) {
      this._showError('lf-email-err', input, 'El email es requerido.');
      return false;
    }
    if (!isValidEmailFormat(val)) {
      this._showError('lf-email-err', input, 'Formato de email inválido.');
      return false;
    }
    if (isFreeEmailDomain(val)) {
      this._showError('lf-email-err', input, 'Solo se permiten correos institucionales (no Gmail, Hotmail, etc.).');
      return false;
    }
    this._clearError('lf-email-err', input);
    return true;
  }

  _handleSubmit() {
    const emailInput = this.querySelector('#lf-email');
    const passInput  = this.querySelector('#lf-pass');
    const submitBtn  = this.querySelector('#lf-submit');

    let valid = true;

    if (!this._validateEmail(emailInput)) valid = false;

    if (!passInput.value) {
      this._showError('lf-pass-err', passInput, 'La contraseña es requerida.');
      valid = false;
    }

    if (!valid) return;

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate slight network delay for UX
    setTimeout(() => {
      const result = attemptLogin(emailInput.value, passInput.value);

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      if (result.ok) {
        // Hide demo hint after success
        this.querySelector('#lf-demo-hint').style.display = 'none';
        submitBtn.innerHTML = '<span class="btn-label">✓ Acceso concedido</span>';
        submitBtn.style.background = '#27ae60';
        setTimeout(() => {
          window.location.href = 'examenes.html';
        }, 700);
      } else {
        if (result.reason === 'no_user') {
          this._showError('lf-email-err', emailInput, 'No existe un usuario con este email.');
        } else {
          this._showError('lf-pass-err', passInput, 'Contraseña incorrecta.');
          passInput.value = '';
          passInput.focus();
        }
      }
    }, 600);
  }

  _showError(errId, input, msg) {
    input.classList.add('login-card__input--error');
    const el = this.querySelector(`#${errId}`);
    if (el) el.textContent = `⚠ ${msg}`;
  }

  _clearError(errId, input) {
    input.classList.remove('login-card__input--error');
    const el = this.querySelector(`#${errId}`);
    if (el) el.textContent = '';
  }
}

customElements.define('acme-login-form', AcmeLoginForm);