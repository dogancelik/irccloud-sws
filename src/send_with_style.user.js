(function () {

'use strict';

var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());

function embedStyle() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '/* @include ../build/style.css */';
  document.head.appendChild(style);
}

var swsEnabled, swsAlias, swsMarkdown, swsKeyboard, swsKeyCtrl, swsKeyAlt, swsKeyShift, swsKeyChar, shortcutWaiting, swsColorsTable, swsSpecialFuncs, colorsTable, last2Keys;

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

// colorsTable start
function initColorsTable(colorsTable) {
  var scroll = $('.scroll');
  scroll.append(colorsTable);
  return colorsTable.css({
    position: 'fixed',
    display: 'none'
  });
}

var currentInput; // required for colorsTable click

function toggleColorsTable(input, toggle) {
  var offset = input.offset();

  if (colorsTable.data('sws') !== '1') {
    colorsTable.find('td').on('click', function() {
      var number = $(this).children().first().text();
      var text = currentInput.val();
      currentInput.val(text + number);
      toggleColorsTable(currentInput, false);
    });
    colorsTable.data('sws', '1');
  }

  colorsTable.css({
    display: (toggle ? 'block' : 'none'),
    left: offset.left + 'px',
    top: (offset.top - 40) + 'px'
  });
}

// required for showing colorsTable in normal mode
function trackLast2Keys(key) {
  last2Keys += key;
  if (last2Keys.length > 2) {
    last2Keys = last2Keys.substring(1,3);
  }
}

function replaceColorsTable() {
  var scroll = currentInput.parents('.buffer').find('.scroll');
  scroll.append(colorsTable.detach());
}
// colorsTable end

// specialFunctions start
function rainbow(text, match) {
  var output = '';
  var colors = ['05', '04', '07', '08', '09', '03', '11', '10', '12', '02', '06', '13', '15', '14'];
  var startIndex = Math.floor(Math.random() * colors.length);

  for (var i = 0; i < match.length; i++) {
    var char = match[i];
    if (char !== ' ') {
      output += fontStyles.color + colors[startIndex++] + char + fontStyles.color;
    } else {
      output += char;
    }
    if (startIndex >= colors.length) {
      startIndex = 0;
    }
  }

  return output;
}

var specialFunctions = [
  {
    regex: /<rainbow>(.*)<\/rainbow>/g,
    func: rainbow
  }
];

function replaceSpecials(text) {
  var oldText = text;
  var newText = oldText;
  for (var i = 0; i < specialFunctions.length; i++) {
    var item = specialFunctions[i];
    newText = oldText.replace(item.regex, item.func);
  }
  return newText;
}
// specialFunctions end

function bindTextarea () {
  if (cb() == null) {
    return false;
  }

  var input = $('#bufferInputView' + cb().bid());
  currentInput = input;

  replaceColorsTable();

  if (input.data('sws') !== '1') {
    input.on('keypress', function (e) {
      var lowerKey = String.fromCharCode(e.which).toLowerCase();
      if (e.which > 31) {
        trackLast2Keys(lowerKey);
      }
    });

    input.on('keyup', function (e) {
      var keyboardEnabled = swsKeyboard.prop('checked');
      var colorsEnabled = swsColorsTable.prop('checked');
      if (colorsEnabled && !keyboardEnabled && last2Keys === '%c') {
        toggleColorsTable(input, true);
      }
    });

    input.on('keydown', function (e) {
      var mainEnabled = swsEnabled.prop('checked');
      var keyboardEnabled = swsKeyboard.prop('checked');
      var markdownEnabled = swsMarkdown.prop('checked');
      var colorsEnabled = swsColorsTable.prop('checked');
      var specialEnabled = swsSpecialFuncs.prop('checked');
      var lowerKey = (isChrome ? String.fromCharCode(e.which) : e.key).toLowerCase();

      if (colorsEnabled) {
        toggleColorsTable(input, false);
      }

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
        var val = input.val();
        val = replaceAliases(val);
        input.val(val);

        if (specialEnabled) {
          var val = input.val();
          val = replaceSpecials(val);
          input.val(val);
        }

        if (!keyboardEnabled) {
          var val = input.val();
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
            if (colorsEnabled) {
              toggleColorsTable(input, true);
            }
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
  return $('<div id="sws-bar" class="settingsMenu__item settingsMenu__item__sendwithstyle"><a class="settingsMenu__link" href="#?/settings=sendwithstyle">Send with Style</a></div>').insertAfter('.settingsContainer .settingsMenu .settingsMenu__item:last');
}

function createContainer() {
  return $('/* @include ../build/container.html */').insertAfter('.settingsContentsWrapper .settingsContents:last');
}

function init() {
  embedStyle();

  var menu = createMenu();
  var container = createContainer();

  if (window.location.hash === '#?/settings=sendwithstyle') {
    window.location.hash = '#?/settings';
    menu.find('a')[0].click();
  }

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

  swsColorsTable = container.find('#sws-colors-table').change(function () {
    localStorage.setItem('swsColorsTable', this.checked);
    if (!this.checked) {
      colorsTable.css('display', 'none');
    }
  }).prop('checked', JSON.parse(localStorage.getItem('swsColorsTable')) || false);

  var origColorsTable = container.find('.sws-colors-table');
  colorsTable = initColorsTable(origColorsTable.clone()); // always initialize it

  swsSpecialFuncs = container.find('#sws-special-funcs').change(function () {
    localStorage.setItem('swsSpecialFuncs', this.checked);
  }).prop('checked', JSON.parse(localStorage.getItem('swsSpecialFuncs')) || false);

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
