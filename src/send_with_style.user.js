(function () {

'use strict';

function embedStyle() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '/* @include ../build/style.css */';
  document.head.appendChild(style);
}

var checkbox, swsAlias, swsMarkdown;

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
  if (swsMarkdown.prop('checked')) {
    return str.replace(/\*{3}([^\*]+)\*{3}/g, '%B%I$1%I%B')
      .replace(/\*{2}([^\*]+)\*{2}/g, '%B$1%B')
      .replace(/\*{1}([^\*]+)\*{1}/g, '%I$1%I');
  } else {
    return str;
  }
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

function bindTextarea () {
  var input = $('#bufferInputView' + cb().bid());
  if (input.data('sws') !== '1') {
    input.on('keydown', function (e) {
      if (e.keyCode === 13 && checkbox.prop('checked')) {
        var val = input.val();
        val = replaceAliases(val);
        val = replaceMarkdown(val);
        val = replaceFontStyles(val);
        input.val(val);
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

  checkbox = container.find('#sws-enabled-check').change(function () {
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
