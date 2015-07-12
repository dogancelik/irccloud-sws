// ==UserScript==
// @name        Send with Style
// @namespace   dogancelik.com
// @description Enables font styles in IRCCloud
// @include     https://www.irccloud.com/*
// @version     3.0.1
// @grant       none
// @updateURL   https://github.com/dogancelik/irccloud-sws/raw/master/build/send_with_style.meta.js
// @downloadURL https://github.com/dogancelik/irccloud-sws/raw/master/build/send_with_style.user.js
// ==/UserScript==

(function () {

'use strict';

var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());

function embedStyle() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '#sws-container{font-size:18px;display:none}#sws-bar{color:#c0dbff;float:right;}#sws-bar::after{content:"\\00a0|\\00a0"}#sws-bar a{cursor:pointer}.sws-little-box{display:inline-block;height:20px;width:20px;border:1px solid #000;text-align:center;font-size:.7em}.sws-info-table{width:100%;border:1px solid rgba(0,0,0,0.1);border-radius:.2em;padding:.5em}#sws-colors-box{display:none}#sws-colors-anchor{cursor:pointer}.sws-key-box{display:inline-block;background-color:rgba(0,0,0,0.1);border-radius:.25em;padding:.25em .5em;margin-right:.25em}#sws-key-char{width:30px}#sws-donate{font-weight:bold;}#sws-donate a{vertical-align:top}#sws-custom-alias{height:60px;width:100%}#sws-enabled-label{font-weight:normal}#sws-enabled-check:not(:checked) ~ #sws-enabled-label{color:#f00;}#sws-enabled-check:not(:checked) ~ #sws-enabled-label::after{content:"Not enabled"}#sws-enabled-check:checked ~ #sws-enabled-label{color:#008000;}#sws-enabled-check:checked ~ #sws-enabled-label::after{content:"Enabled"}';
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
        var val = input.val();
        val = replaceAliases(val);
        input.val(val);

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
  return $('<div id="sws-container" class="accountContainer"><button type="button" class="close"><span>Close</span></button><h2><span>Send with Style&nbsp;</span><input id="sws-enabled-check" type="checkbox"/>&nbsp;<label id="sws-enabled-label" for="sws-enabled-check"></label></h2><p class="explanation">Type your text as you normally would, use the codes to style your text.</p><table class="sws-info-table"><tr><th>Code</th><th>Example</th></tr><tr><td><code>%C</code>&nbsp;for&nbsp;<a id="sws-colors-anchor" title="Click here to show color numbers" style="border-bottom: 1px dashed black;"><font color="#ff0000">c</font><font color="#cc8f33">o</font><font color="#99ed66">l</font><font color="#66f899">o</font><font color="#33accc">r</font></a></td><td><code>%C2This is blue</code> → <code><span style="color: blue">This is blue</span></code></td></tr><tr id="sws-colors-box"><td colspan="2"><span class="sws-little-box bg-white black">0</span><span class="sws-little-box bg-black white">1</span><span class="sws-little-box bg-navy white">2</span><span class="sws-little-box bg-green white">3</span><span class="sws-little-box bg-red black">4</span><span class="sws-little-box bg-maroon white">5</span><span class="sws-little-box bg-purple white">6</span><span class="sws-little-box bg-orange black">7</span><span class="sws-little-box bg-yellow black">8</span><span class="sws-little-box bg-lime black">9</span><span class="sws-little-box bg-teal white">10</span><span class="sws-little-box bg-cyan black">11</span><span class="sws-little-box bg-blue white">12</span><span class="sws-little-box bg-magenta black">13</span><span class="sws-little-box bg-grey black">14</span><span class="sws-little-box bg-silver black">15</span></td></tr><tr><td><code>%B</code> for <b>bold</b></td><td><code>%BVery bold</code> → <code><b>Very bold</b></code></td></tr><tr><td><code>%I</code> for <i>italic</i></td><td><code>%IPizza</code> → <code><i>Pizza</i></code></td></tr><tr><td><code>%U</code> for <u>underline</u></td><td><code>%UBeep</code> → <code><u>Beep</u></code></td></tr><tr><td><code>%R</code> for reset</td><td><code>%C4Wo%Rrd</code> → <code><span style="color: red">Wo</span>rd</code></td></tr></table><p class="explanation"><input id="sws-keyboard-mode" type="checkbox"/><label for="sws-keyboard-mode">&nbsp;Keyboard Mode (Disables %C, %B etc.)&nbsp;</label><span class="sws-key-box"><label for="sws-key-ctrl">Ctrl:&nbsp;</label><input id="sws-key-ctrl" type="checkbox"/></span><span class="sws-key-box"><label for="sws-key-alt">Alt:&nbsp;</label><input id="sws-key-alt" type="checkbox"/></span><span class="sws-key-box"><label for="sws-key-alt">Shift:&nbsp;</label><input id="sws-key-shift" type="checkbox"/></span><span class="sws-key-box">     <label for="sws-key-char">Key:&nbsp;</label><input id="sws-key-char" type="text"/></span></p><p class="explanation"><input id="sws-markdown-mode" type="checkbox"/><label for="sws-markdown-mode">&nbsp;Markdown Mode (Enables <code>*</code> and <code>**</code> for italic and bold text)</label></p><p class="explanation">Custom aliases</p><textarea id="sws-custom-alias"></textarea><p id="sws-donate" class="explanation">If you like this script, please <a href="https://flattr.com/submit/auto?user_id=dogancelik&amp;url=https%3A%2F%2Fgithub.com%2Fdogancelik%2Firccloud-sws" target="_blank">Flattr it</a>&nbsp;or help me via&nbsp;<a href="https://gratipay.com/dogancelik/" target="_blank">Gratipay</a></p><p class="explanation"><a href="https://github.com/dogancelik/irccloud-sws" target="_blank">Source code</a>&nbsp;-&nbsp;<a href="https://github.com/dogancelik/irccloud-sws/wiki/Help" target="_blank">Help page</a></p></div>').insertAfter('#upgradeContainer');
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
