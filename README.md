# WebDP100
A work-in-progress web-based driver (and maybe eventually GUI?) for the Alientek DP100 digital power supply, using [WebHID](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API).

Just plug in the DP100 using the USB-A to USB-A cable (make sure it's in "USBD" mode; double-tap ◀ to switch), and click connect!

<img src="https://github.com/scottbez1/webdp100/assets/414890/846fbe78-497b-4f76-9dce-f7f3ffbbe971" width=300 />

## Demo

Watch the [video](https://youtu.be/46w4E4JxKYE)

If you have a DP100, plug it in via USB, open Chrome and go to https://scottbez1.github.io/webdp100 to try this for yourself!

## About

Implementation of the HID protocol is based on reverse-engineering the Windows library (`ATK-DP100DLL(x64)_2.0.dll`), which can be found on baidu or in the [DP100-PyQt5-GUI](https://github.com/ElluIFX/DP100-PyQt5-GUI) project.

I don't plan on building a full-featured web interface, but if you want to, please feel free to use this as a starting point for your own project!

## Usage notes
### Linux
No drivers need to be installed, but the HID device may default to root-only permissions, resulting in "Failed to open the device" when you select it in the browser.

To adjust USB permissions, copy the `udev/rules.d/99-atk-dp100.rules` from this repo to the `/etc/udev/rules.d/` folder on your computer, then run `sudo udevadm control --reload-rules` and re-plug the USB cable.

## Acknowledgements
Shout out to @ElluIFX's [DP100-PyQt5-GUI](https://github.com/ElluIFX/DP100-PyQt5-GUI) project as a helpful reference and source of the DLL for reverse-engineering.

## License
This project is licensed under Apache v2

    Copyright 2023 Scott Bezek
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
