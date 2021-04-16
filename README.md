[![view on npm](http://img.shields.io/npm/v/homebridge-icomfort.svg)](https://www.npmjs.org/package/homebridge-icomfort)
[![npm module downloads](http://img.shields.io/npm/dt/homebridge-icomfort.svg)](https://www.npmjs.org/package/homebridge-icomfort)


# homebridge-icomfort

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) for the Lennox iComfort Thermostat implemented in Java Script.

The plugin works with the [iComfort Wi-Fi](https://www.lennox.com/products/comfort-controls/thermostats/icomfortwi-fi) (controllable online using the [My iComfort system](https://www.myicomfort.com/)). It probably will *not* work if you ahve the [iComfort S30/E30/M30](https://www.support.lennoxicomfort.com/help/compare/compare.html) models (controllable online using the [Lennox iComfort system](https://www.lennoxicomfort.com)).

Update 7/9/2020: Version 2.0.0
- Temperature rounding fixes, code cleanup and some other minor bug fixes.

Update 3/27/2018: Version 1.0.0
- Added support for zones. Added an optional zoneNumber parameter (defaults to 0 for single zone systems). For multi-zone systems just add another configuration with a unique name and zoneNumber.
- Deprecated Program Mode setting. Lennox changed their interface and it no longer works. Switching modes (OFF, COOL, HEAT, AUTO) will only work in manual mode and not in program / schedule  mode.
- Added Away custom characteristic to enable / disable Away mode. This characteristic is not available from the Apple Home.app. It is available in more functional HomeKit apps and can be added to an automation or scene which can be triggered by Siri or the Home.app.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-icomfort
3. Update your configuration file. See below for a sample. 

# Example Configuration

```json
  {
    "accessory": "iComfortThermostat",
    "name": "Thermostat",
    "username": "USERNAME",
    "password": "PASSWORD",
    "gatewaySN": "SERIAL_NUMBER",
    "zoneNumber": 0
  }
```

`USERNAME` and `PASSWORD` should be your My iComfort login information.

You can find the `SERIAL_NUMBER` by logging in to [My iComfort system](https://www.myicomfort.com/), selecting the “System” tab, and looking for your Thermostat Serial Number (e.g., XY12Z34567).


## License
This work is licensed under the MIT license. See [license](LICENSE) for more details.

## Thanks
Thanks to [Daniel McQuiston](https://github.com/deHugo) for his [icomfort-js](https://github.com/deHugo/icomfort-js) repo which is used as the interface to the iComfort Thermostat.

