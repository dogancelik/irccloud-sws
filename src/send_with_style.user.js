(function () {

'use strict';

var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());

function embedStyle() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '/* @include ../build/style.css */';
  document.head.appendChild(style);
}

var swsEnabled, swsAlias, swsMarkdown, swsKeyboard, swsKeyCtrl, swsKeyAlt, swsKeyShift, swsKeyChar, shortcutWaiting;

var fontStyles = {
  color: '\u0003',
  bold: '\u0002',
  reset: '\u000f',
  italic: '\u001d',
  underline: '\u001f'
};

function replaceFontStyles (str) {
  return str.replace(/%B/g, fontStyles.bold)
    .replace(/%R/g, fontStyles.reset)
    .replace(/%I/g, fontStyles.italic)
    .replace(/%U/g, fontStyles.underline)
    .replace(/%C/g, fontStyles.color);
}

function replaceMarkdown (str) {
  return str.replace(/\*{3}([^\*]+)\*{3}/g, fontStyles.bold + fontStyles.italic + '$1' + fontStyles.italic + fontStyles.bold)
    .replace(/\*{2}([^\*]+)\*{2}/g, fontStyles.bold + '$1' + fontStyles.bold)
    .replace(/\*{1}([^\*]+)\*{1}/g, fontStyles.italic + '$1' + fontStyles.italic);
}

function replaceAliases (str) {
  if (swsAlias.val().trim() === "") {
    return str;
  } else {
    swsAlias.val().split('\n').forEach(function (i) {
      var keyval = i.split(/,(.*)/g);
      str = str.split(keyval[0]).join(keyval[1]);
    });
    return str;
  }
}

function toggleShortcutProgress (input, toggle) {
  if (toggle) {
    input.css('outline', '1px solid blue');
    shortcutWaiting = true;
  } else {
    input.css('outline', '');
    shortcutWaiting = false;
  }
}

function insertTo(input, text) {
  var cursorPos = input.prop('selectionStart');
  var val = input.val();
  var before = val.substring(0, cursorPos);
  var after  = val.substring(cursorPos, val.length);
  input.val(before + text + after);
  input.prop('selectionStart', cursorPos + 1);
  input.prop('selectionEnd', cursorPos + 1);
}

function bindTextarea () {
  var input = $('#bufferInputView' + cb().bid());
  if (input.data('sws') !== '1') {
    input.on('keydown', function (e) {
      var mainEnabled = swsEnabled.prop('checked');
      var keyboardEnabled = swsKeyboard.prop('checked');
      var markdownEnabled = swsMarkdown.prop('checked');
      var lowerKey = (isChrome ? String.fromCharCode(e.which) : e.key).toLowerCase();

      if (keyboardEnabled) {
        var enabledCtrl = swsKeyCtrl.prop('checked');
        var enabledAlt = swsKeyAlt.prop('checked');
        var enabledShift = swsKeyShift.prop('checked');
        var activateChar = swsKeyChar.val().trim().substr(0, 1).toLowerCase();

        if (e.ctrlKey === enabledCtrl && e.altKey === enabledAlt && e.shiftKey === enabledShift && lowerKey == activateChar) {
          toggleShortcutProgress(input, true);
          return;
        }
      }

      if (e.keyCode === 13 && mainEnabled) {

        if (!keyboardEnabled) {
          var val = input.val();
          val = replaceAliases(val);
          val = replaceFontStyles(val);
          input.val(val);
        }

        if (markdownEnabled) {
          var val = input.val();
          val = replaceMarkdown(val);
          input.val(val);
        }
      }

      if (shortcutWaiting && keyboardEnabled) {
        var noInput = false;
        switch (lowerKey) {
          case "c":
            insertTo(input, fontStyles.color);
            noInput = true;
            break;
          case "b":
            insertTo(input, fontStyles.bold);
            noInput = true;
            break;
          case "i":
            insertTo(input, fontStyles.italic);
            noInput = true;
            break;
          case "u":
            insertTo(input, fontStyles.underline);
            noInput = true;
            break;
          case "r":
            insertTo(input, fontStyles.reset);
            noInput = true;
            break;
        }
        toggleShortcutProgress(input, false);
        if (noInput) return false;
      }
    });
    input.data('sws', '1');
  }
}

function createMenu() {
  return $('<div id="sws-bar"><a>Send with Style</a></div>').insertAfter('#statusActions');
}

function createContainer() {
  return $('/* @include ../build/container.html */').insertAfter('#upgradeContainer');
}

function init() {
  embedStyle();

  var menu = createMenu();
  menu.children('a').on('click', function () {
    container.fadeIn();
  });

  var container = createContainer();
  container.find('.close').on('click', function () {
    container.fadeOut();
  });

  swsEnabled = container.find('#sws-enabled-check').change(function () {
    localStorage.setItem('swsEnabled', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsEnabled')) || true);

  var colorsBox = container.find('#sws-colors-box');
  container.find('#sws-colors-anchor').click(function () {
    colorsBox.toggle();
  });

  swsAlias = container.find("#sws-custom-alias");
  swsAlias.val(localStorage.getItem('swsAlias'))
  .on('change', function () {
    localStorage.setItem('swsAlias', swsAlias.val());
  });

  swsKeyboard = container.find('#sws-keyboard-mode').change(function () {
    localStorage.setItem('swsKeyboard', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsKeyboard')) || false);

  swsKeyCtrl = container.find('#sws-key-ctrl').change(function () {
    localStorage.setItem('swsKeyCtrl', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsKeyCtrl')) || true);

  swsKeyAlt = container.find('#sws-key-alt').change(function () {
    localStorage.setItem('swsKeyAlt', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsKeyAlt')) || false);

  swsKeyShift = container.find('#sws-key-shift').change(function () {
    localStorage.setItem('swsKeyShift', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsKeyShift')) || true);

  swsKeyChar = container.find('#sws-key-char').change(function () {
    localStorage.setItem('swsKeyChar', this.value);
  }).val(localStorage.getItem('swsKeyChar') || 'z');

  swsMarkdown = container.find('#sws-markdown-mode').change(function () {
    localStorage.setItem('swsMarkdown', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsMarkdown')) || false);

  bindTextarea();
}

(function checkSession () {
  if (window.hasOwnProperty('SESSION')) {
    window.SESSION.bind('init', function () {
      init();
    });
  } else {
    setTimeout(checkSession, 100);
  }
})();

window.onhashchange = function () { bindTextarea(); };

})();
