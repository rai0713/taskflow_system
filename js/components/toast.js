(function (global) {
  'use strict';

  function ensureContainer() {
    var el = document.getElementById('app-toast-container');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'app-toast-container';
    el.className = 'tf-toast-container';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
    return el;
  }

  function toast(opts) {
    opts = opts || {};
    var type = opts.type || 'info';
    var title = opts.title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice');
    var message = opts.message || '';
    var duration = typeof opts.duration === 'number' ? opts.duration : 2600;

    var container = ensureContainer();

    var root = document.createElement('div');
    root.className = 'tf-toast tf-toast--' + type;

    var row = document.createElement('div');
    row.className = 'tf-toast__row';

    var icon = document.createElement('div');
    icon.className = 'tf-toast__icon';

    var content = document.createElement('div');

    var h = document.createElement('p');
    h.className = 'tf-toast__title';
    h.textContent = title;

    var p = document.createElement('p');
    p.className = 'tf-toast__message';
    p.textContent = message;

    content.appendChild(h);
    if (message) content.appendChild(p);

    row.appendChild(icon);
    row.appendChild(content);

    var progress = document.createElement('div');
    progress.className = 'tf-toast__progress';

    var bar = document.createElement('div');
    bar.className = 'tf-toast__bar';
    bar.style.animation = 'tfToastBar ' + duration + 'ms linear forwards';

    progress.appendChild(bar);

    root.appendChild(row);
    root.appendChild(progress);

    container.appendChild(root);

    window.setTimeout(function () {
      root.style.opacity = '0';
      root.style.transition = 'opacity 200ms ease';
      window.setTimeout(function () {
        if (root && root.parentNode) root.parentNode.removeChild(root);
      }, 240);
    }, duration);
  }

  global.TaskFlowToast = {
    show: toast,
    success: function (message, title) { toast({ type: 'success', title: title || 'Success', message: message }); },
    error: function (message, title) { toast({ type: 'error', title: title || 'Error', message: message }); },
    info: function (message, title) { toast({ type: 'info', title: title || 'Notice', message: message }); },
    warning: function (message, title) { toast({ type: 'warning', title: title || 'Warning', message: message }); }
  };
})(window);
