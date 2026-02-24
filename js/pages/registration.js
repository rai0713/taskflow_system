(function () {
  'use strict';

  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function showToast(type, message, title) {
    if (window.TaskFlowToast && typeof window.TaskFlowToast.show === 'function') {
      window.TaskFlowToast.show({
        type: type,
        title: title,
        message: message
      });
    }
  }

  function setButtonLoading(btn, isLoading, loadingText) {
    if (!btn) return;

    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;

    if (isLoading) {
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.innerHTML = '<span class="tf-btn-spinner" aria-hidden="true"></span>' + (loadingText || 'Loading...');
    } else {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText;
    }
  }

  // Stepper / progress logic
  (function initStepper() {
    var form = document.getElementById('sign-up-form');
    if (!form) return;

    var panels = $all('.tf-panel', form);
    var steps = $all('.tf-step', form);
    var bar = document.getElementById('tf-stepper-bar');

    var bottomPrev = null;
    var bottomNext = null;
    var bottomSubmit = null;

    function resolveBottomButtons() {
      bottomPrev = document.getElementById('tf-bottom-prev');
      bottomNext = document.getElementById('tf-bottom-next');
      bottomSubmit = document.getElementById('tf-bottom-submit');
    }

    function focusFirstField(panel) {
      var el = panel.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
      if (el) el.focus({ preventScroll: true });
    }

    function setBottomActions(idx) {
      if (!bottomPrev || !bottomNext || !bottomSubmit) return;

      bottomPrev.style.display = (idx === 0) ? 'none' : '';

      var isLast = idx === (panels.length - 1);
      bottomNext.style.display = isLast ? 'none' : '';
      bottomSubmit.style.display = isLast ? '' : 'none';
    }

    function setActiveStep(idx) {
      panels.forEach(function (p) {
        p.classList.toggle('is-active', Number(p.dataset.step) === idx);
      });

      steps.forEach(function (s) {
        var isActive = Number(s.dataset.step) === idx;
        s.classList.toggle('tf-step--active', isActive);
        if (isActive) s.setAttribute('aria-current', 'step');
        else s.removeAttribute('aria-current');
      });

      var progress = (idx) / (steps.length - 1);
      if (bar) bar.style.width = (progress * 100) + '%';

      var activePanel = panels.find(function (p) { return Number(p.dataset.step) === idx; });
      if (activePanel) focusFirstField(activePanel);

      setBottomActions(idx);

      try { history.replaceState(null, '', '#step-' + (idx + 1)); } catch (e) { }
    }

    function labelFor(el) {
      if (!el) return 'This field';
      var id = el.getAttribute('id');
      if (id) {
        var lbl = form.querySelector('label[for="' + id.replace(/"/g, '') + '"]');
        if (lbl) return (lbl.textContent || '').replace(/\s*\(Optional\)\s*/i, '').trim();
      }
      if (el.name) return el.name;
      return 'This field';
    }

    function messageFor(el) {
      var name = labelFor(el);
      var value = (el && typeof el.value === 'string') ? el.value.trim() : (el && el.value ? String(el.value).trim() : '');
      var isRequired = !!(el && (el.hasAttribute('required') || el.getAttribute('data-required') === '1'));

      // Our primary required check (since we removed native required attributes)
      if (isRequired && value === '') {
        return name + ' is required.';
      }

      // For other native constraints (email type, pattern, min/max)
      var v = (el && el.validity) ? el.validity : null;
      if (v) {
        if (v.typeMismatch) return 'Please enter a valid ' + name.toLowerCase() + '.';
        if (v.patternMismatch) return 'Please enter a valid ' + name.toLowerCase() + '.';
        if (v.tooShort) return name + ' is too short.';
        if (v.tooLong) return name + ' is too long.';
        if (v.rangeUnderflow || v.rangeOverflow) return 'Please enter a valid ' + name.toLowerCase() + '.';
      }

      return name + ' is invalid.';
    }

    function validatePanel(panel) {
      var fields = $all('input, select, textarea', panel)
        .filter(function (el) { return el.type !== 'hidden' && !el.disabled; });

      var ok = true;
      var firstInvalid = null;

      fields.forEach(function (el) {
        var isRequired = el.hasAttribute('required') || el.getAttribute('data-required') === '1';
        var value = (el.value || '').trim();

        // Do NOT clear .is-invalid here.
        // Legacy validation (script.js) uses .is-invalid for capitalization/age rules.
        // Clearing it would allow bypassing those errors.

        // 1) Required check (custom, no native tooltip)
        if (isRequired && value === '') {
          ok = false;
          if (!firstInvalid) firstInvalid = el;

          el.classList.add('is-invalid');

          var groupReq = el.closest('.input-group') || el.parentElement;
          if (groupReq) {
            var fbReq = groupReq.querySelector('.invalid-feedback');
            if (fbReq) fbReq.textContent = labelFor(el) + ' is required.';
          }
          return;
        }

        // 2) Other native constraints (email format, pattern, etc.)
        // Note: we do not remove is-invalid when valid; legacy script owns those flags.
        if (value !== '' && typeof el.checkValidity === 'function' && !el.checkValidity()) {
          ok = false;
          if (!firstInvalid) firstInvalid = el;

          el.classList.add('is-invalid');

          var groupNative = el.closest('.input-group') || el.parentElement;
          if (groupNative) {
            var fbNative = groupNative.querySelector('.invalid-feedback');
            if (fbNative) fbNative.textContent = messageFor(el);
          }
        }
      });

      if (!ok && firstInvalid) {
        if (typeof firstInvalid.focus === 'function') {
          firstInvalid.focus({ preventScroll: false });
        }

        // Toast should be generic so users read the inline field messages
        showToast('error', 'Please fix the highlighted fields before proceeding.', 'Error');
      }

      return ok;
    }

    function currentIndex() {
      var active = panels.find(function (p) { return p.classList.contains('is-active'); });
      return active ? Number(active.dataset.step) : 0;
    }

    function goNext() {
      var idx = currentIndex();
      var panel = panels.find(function (p) { return Number(p.dataset.step) === idx; });
      if (panel && !validatePanel(panel)) return;

      // If legacy validation script marks fields invalid OR shows step-level error text, block next step.
      // Priority: field-level errors first (is-invalid), then helper errors (age/birthdate).
      var firstInvalidEl = panel ? panel.querySelector('.is-invalid') : null;

      var ageErrorEl = document.getElementById('age-error');
      var birthdateErrorEl = document.getElementById('birthdate-error');
      var helperErrorText = '';
      if (ageErrorEl && ageErrorEl.textContent && ageErrorEl.textContent.trim()) helperErrorText = ageErrorEl.textContent.trim();
      else if (birthdateErrorEl && birthdateErrorEl.textContent && birthdateErrorEl.textContent.trim()) helperErrorText = birthdateErrorEl.textContent.trim();

      if (firstInvalidEl) {
        if (typeof firstInvalidEl.focus === 'function') firstInvalidEl.focus({ preventScroll: false });
        showToast('error', 'Please fix the highlighted fields before proceeding.', 'Error');
        return;
      }

      if (helperErrorText) {
        // Keep toast consistent with other validation: generic
        showToast('error', 'Please fix the highlighted fields before proceeding.', 'Error');

        // Ensure helper text is visibly an error (red)
        if (ageErrorEl) {
          ageErrorEl.classList.add('text-danger');
        }
        if (birthdateErrorEl) {
          birthdateErrorEl.classList.add('text-danger');
        }

        return;
      }

      setActiveStep(Math.min(idx + 1, panels.length - 1));
    }

    function validateAllPreviousSteps(upToIdx) {
      for (var i = 0; i < upToIdx; i++) {
        var p = panels.find(function (panel) { return Number(panel.dataset.step) === i; });
        if (p && !validatePanel(p)) {
          return false;
        }

        // Also check legacy validation errors
        var ageErrorEl = document.getElementById('age-error');
        var birthdateErrorEl = document.getElementById('birthdate-error');
        if (ageErrorEl && ageErrorEl.textContent && ageErrorEl.textContent.trim()) {
          showToast('error', 'Step ' + (i + 1) + ' has validation errors. Please fix them before proceeding.', 'Error');
          setActiveStep(i);
          return false;
        }
        if (birthdateErrorEl && birthdateErrorEl.textContent && birthdateErrorEl.textContent.trim()) {
          showToast('error', 'Step ' + (i + 1) + ' has validation errors. Please fix them before proceeding.', 'Error');
          setActiveStep(i);
          return false;
        }
      }
      return true;
    }

    function goPrev() {
      var idx = currentIndex();
      setActiveStep(Math.max(idx - 1, 0));
    }

    function bindBottomButtons() {
      resolveBottomButtons();
      if (bottomNext) bottomNext.addEventListener('click', function () { goNext(); });
      if (bottomPrev) bottomPrev.addEventListener('click', function () { goPrev(); });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindBottomButtons);
    } else {
      bindBottomButtons();
    }

    steps.forEach(function (stepBtn) {
      stepBtn.addEventListener('click', function () {
        var target = Number(stepBtn.dataset.step);
        var idx = currentIndex();
        if (target > idx) {
          // When jumping forward, validate ALL previous steps, not just the current one
          if (!validateAllPreviousSteps(target)) {
            return;
          }
        }
        setActiveStep(target);
      });
    });

    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'textarea') return;

      var idx = currentIndex();
      if (idx < panels.length - 1) {
        e.preventDefault();
        goNext();
      }
    });

    var m = (location.hash || '').match(/#step-(\d+)/);
    var initial = m ? Math.max(0, Math.min(panels.length - 1, Number(m[1]) - 1)) : 0;
    setActiveStep(initial);
  })();

  // Disable already-selected security questions across the 3 dropdowns
  (function initSecurityQuestions() {
    function updateSecurityQuestionOptions() {
      var selects = $all('select.security-question');
      var selectedValues = new Set(
        selects.map(function (s) { return s.value; }).filter(function (v) { return v && v !== ''; })
      );

      selects.forEach(function (currentSelect) {
        var currentValue = currentSelect.value;
        Array.from(currentSelect.options).forEach(function (opt) {
          if (!opt.value) return;
          var shouldDisable = selectedValues.has(opt.value) && opt.value !== currentValue;
          opt.disabled = shouldDisable;
        });
      });
    }

    document.addEventListener('change', function (e) {
      if (e.target && e.target.matches && e.target.matches('select.security-question')) {
        updateSecurityQuestionOptions();
      }
    });

    document.addEventListener('DOMContentLoaded', updateSecurityQuestionOptions);
  })();

  // AJAX registration submit + toast + loading button + full validation + SHA-256 hashing
  (function initAjaxSubmit() {
    var form = document.getElementById('sign-up-form');
    if (!form) return;

    var submitBtn = document.getElementById('tf-bottom-submit');

    // SHA-256 hash helper (returns hex string)
    async function sha256(text) {
      var encoder = new TextEncoder();
      var data = encoder.encode(text.trim().toLowerCase()); // normalize: trim + lowercase before hashing
      var hashBuffer = await crypto.subtle.digest('SHA-256', data);
      var hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var isValid = true;

      // ── Step 1: Personal ──
      if (typeof window.checkFirstName === 'function' && !window.checkFirstName()) isValid = false;
      if (typeof window.checkMiddleName === 'function' && !window.checkMiddleName()) isValid = false;
      if (typeof window.checkLastName === 'function' && !window.checkLastName()) isValid = false;
      if (typeof window.validateSex === 'function' && !window.validateSex()) isValid = false;
      if (typeof window.validateAndSetAge === 'function' && !window.validateAndSetAge()) isValid = false;

      // Async validators
      if (typeof window.validateIdNo === 'function') {
        var idOk = await window.validateIdNo();
        if (!idOk) isValid = false;
      }
      if (typeof window.validateEmail === 'function') {
        var emailOk = await window.validateEmail();
        if (!emailOk) isValid = false;
      }

      // ── Step 2: Address ──
      if (typeof window.purokValidator === 'function' && !window.purokValidator()) isValid = false;
      if (typeof window.validateBarangayName === 'function' && !window.validateBarangayName()) isValid = false;
      if (typeof window.validateCity === 'function' && !window.validateCity()) isValid = false;
      if (typeof window.validateProvince === 'function' && !window.validateProvince()) isValid = false;
      if (typeof window.validateCountry === 'function' && !window.validateCountry()) isValid = false;
      if (typeof window.validateZipCode === 'function' && !window.validateZipCode()) isValid = false;

      // ── Step 3: Account ──
      if (typeof window.checkUserName === 'function') {
        var unameOk = await window.checkUserName();
        if (!unameOk) isValid = false;
      }
      if (typeof window.passwordValidator === 'function') {
        var pwOk = await window.passwordValidator();
        if (!pwOk) isValid = false;
      }
      if (typeof window.confirmPassword === 'function' && !window.confirmPassword()) isValid = false;

      // ── Step 4: Security ──
      if (typeof window.validateAllSecurityQuestions === 'function' && !window.validateAllSecurityQuestions()) isValid = false;

      if (!isValid) {
        showToast('error', 'Please fix all highlighted fields before submitting.', 'Validation Error');
        return;
      }

      setButtonLoading(submitBtn, true, 'Signing up...');

      try {
        var formData = new FormData(form);

        // Hash security answers (SHA-256) before sending
        var answer1 = formData.get('security_answer_1') || '';
        var answer2 = formData.get('security_answer_2') || '';
        var answer3 = formData.get('security_answer_3') || '';

        var hashed1 = await sha256(answer1);
        var hashed2 = await sha256(answer2);
        var hashed3 = await sha256(answer3);

        formData.set('security_answer_1', hashed1);
        formData.set('security_answer_2', hashed2);
        formData.set('security_answer_3', hashed3);

        var res = await fetch(form.getAttribute('action'), {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        var data = await res.json();

        if (data && data.success) {
          showToast('success', data.message || 'Registration successful.', 'Success');
          window.setTimeout(function () {
            var redirectUrl = 'index.html?registered=1';
            if (data && data.message) {
              redirectUrl += '&msg=' + encodeURIComponent(data.message);
            }
            window.location.href = redirectUrl;
          }, 900);
        } else {
          showToast('error', (data && data.message) ? data.message : 'Registration failed.', 'Error');
        }
      } catch (err) {
        showToast('error', (err && err.message) ? err.message : 'Network error. Please try again.', 'Error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  })();
})();
