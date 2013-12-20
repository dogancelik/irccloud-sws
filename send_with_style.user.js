// ==UserScript==
// @name        Send with Style
// @namespace   dogancelik.com
// @description Enables font styles in IRCCloud
// @include     https://www.irccloud.com/#!/*
// @version     1.0.1
// @grant       none
// @updateURL   https://github.com/dogancelik/greasemonkey-scripts/raw/master/send-with-style/send_with_style.user.js
// @downloadURL https://github.com/dogancelik/greasemonkey-scripts/raw/master/send-with-style/send_with_style.user.js
// ==/UserScript==

(function () {

'use strict';

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.sws-little-box { display: inline-block; height: 20px; width: 20px; border: 1px solid black; text-align: center; font-size: .7em }';
document.head.appendChild(style);

var swsEnabled;

function checkBox (bool) {
  if (typeof bool === 'boolean') {
    swsEnabled[0].checked = bool;
  }
  return swsEnabled.is(':checked');
}

var fontStyles = {
  color: '\u0003',
  bold: '\u0002',
  reset: '\u000f',
  italic: '\u0016',
  underline: '\u001f'
};

function bindTextarea () {
  var input = $('#bufferInputView' + cb().bid());
  if (input.data('sws') !== '1') {
    input.on('keydown', function (e) {
      if (e.keyCode === 13 && checkBox()) {
        var val = input.val();
        val = val.replace(/%B/g, fontStyles.bold)
              .replace(/%R/g, fontStyles.reset)
              .replace(/%I/g, fontStyles.italic)
              .replace(/%U/g, fontStyles.underline)
              .replace(/%C/g, fontStyles.color);
        input.val(val);
      }
    });
    input.data('sws', '1');
  }
}

function initSws () {
  var swsBar = $('<div id="swsBar"><a>Send with Style</a> | </div>').insertAfter('#statusActions').css({
    color: '#C0DBFF',
    float: 'right',
    paddingRight: '.5em'
  });
  
  var swsContainer = $('<div class="accountContainer" id="swsContainer" style="line-height: 1.3; font-size: 18px; display: none"> <button class="close" type="button"><span>Close</span></button> <h2>Send with Style</h2> <div> <input type="checkbox" id="swsEnabled"> <label for="swsEnabled" id="swsLabel">Enabled</label> </div> <p class="explanation">Type your text as you normally would, use the codes to style your text.</p> <table width="100%" style="border: 1px solid rgba(0,0,0,.1); border-radius: .2em;padding: .5em;"> <tr> <th>Code</th> <th>Example</th> </tr> <tr> <td><code>%C</code> for <a id="swsShowColors" title="Click here to show color numbers" style="border-bottom: 1px dashed black;"><font color="#ff0000">c</font><font color="#cc8f33">o</font><font color="#99ed66">l</font><font color="#66f899">o</font><font color="#33accc">r</font></a> </td> <td><code>%C2This is blue</code> → <code><span style="color: blue">This is blue</span></code></td> </tr> <tr id="swsColors" style="display: none"> <td colspan="2"> <span class="sws-little-box bg-white black">0</span> <span class="sws-little-box bg-black white">1</span> <span class="sws-little-box bg-navy white">2</span> <span class="sws-little-box bg-green white">3</span> <span class="sws-little-box bg-red black">4</span> <span class="sws-little-box bg-maroon white">5</span> <span class="sws-little-box bg-purple white">6</span> <span class="sws-little-box bg-orange black">7</span> <span class="sws-little-box bg-yellow black">8</span> <span class="sws-little-box bg-lime black">9</span> <span class="sws-little-box bg-teal white">10</span> <span class="sws-little-box bg-cyan black">11</span> <span class="sws-little-box bg-blue white">12</span> <span class="sws-little-box bg-magenta black">13</span> <span class="sws-little-box bg-grey black">14</span> <span class="sws-little-box bg-silver black">15</span> </td> </tr> <tr> <td><code>%B</code> for <b>bold</b></td> <td><code>%BVery bold</code> → <code><b>Very bold</b></code></td> </tr> <tr> <td><code>%I</code> for <i>italic</i></td> <td><code>%IPizza</code> → <code><i>Pizza</i></code></td> </tr> <tr> <td><code>%U</code> for <u>underline</u></td> <td><code>%UBeep</code> → <code><u>Beep</u></code></td> </tr> <tr> <td><code>%R</code> for reset</td> <td><code>%C4Wo%Rrd</code> → <code><span style="color: red">Wo</span>rd</code></td> </tr> </table> <p class="explanation" style="font-weight: bold;">If you like this script, please <a style="vertical-align: top;" href="https://flattr.com/submit/auto?user_id=dogancelik&amp;url=https%3A%2F%2Fgithub.com%2Fdogancelik%2Fgreasemonkey-scripts" target="_blank"><img border="0" src="//api.flattr.com/button/flattr-badge-large.png" alt="Flattr this" title="Flattr this"></a></p> <p class="explanation"><a href="https://github.com/dogancelik/greasemonkey-scripts/tree/master/send-with-style" target="_blank">Source code</a></p></div>')
    .insertAfter($('#upgradeContainer'));
  swsContainer.find('.close').on('click', function () {
    swsContainer.fadeOut();
  });

  swsEnabled = $('#swsEnabled');
  var swsLabel = swsEnabled.next();
  function styleLabel () {
    swsLabel.css({ color: checkBox() ? 'green': 'red' });
    swsLabel.text( checkBox() ? 'Enabled' : 'Not enabled');
  }
  swsEnabled.change(function () {
    styleLabel();
    localStorage.setItem('swsEnabled', checkBox());
  });
  checkBox(JSON.parse(localStorage.getItem('swsEnabled')) || true);
  styleLabel();

  var swsActivator = swsBar.children('a').css({ cursor: 'pointer' });
  swsActivator.on('click', function () {
    swsContainer.fadeIn();
  });

  var swsColors = $('#swsColors');
  swsShowColors = $('#swsShowColors').click(function () {
    swsColors.toggle();
  }).css({ cursor: 'pointer' });

  bindTextarea();
}

(function checkSession () {
  if (window.hasOwnProperty('SESSION')) {
    window.SESSION.bind('init', function () {
      initSws();
    });
  } else {
    setTimeout(checkSession, 100);
  }
})();

window.onhashchange = function () { bindTextarea(); };

})();