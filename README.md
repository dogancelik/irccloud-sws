# Send with Style
Enables text styles in [IRCCloud](https://www.irccloud.com/)

#### [Click here to install](https://github.com/dogancelik/irccloud-sws/raw/master/send_with_style.user.js)

Note for users: People who are using version 2.0.1/2.0.2 should uninstall and install the newer version 2.0.3 with that download link above. Apparently after I released version 2.0.2, it didn't download from 2.0.2's @downloadURL, instead it downloaded from 2.0.1's @downloadURL. I made a simple mistake. Nothing has changed between 2.0.2 and 2.0.3 except Userscript meta block. Anyway I'm not going to update the `send_with_style.user.js` in the root directory anymore, instead I will update the script in the build directory.

![Screenshot](extras/screenshot.jpg)

### Custom aliases (Examples):
Format is: `alias,your original text`

```
%hello,/me says hello!
pls,please
:stare,ಠ_ಠ
```

If you type ":stare", it will output "ಠ_ಠ"

**Supported browsers:** Firefox with Greasemonkey, Chrome with Tampermonkey
