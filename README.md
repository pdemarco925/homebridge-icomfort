# homebridge-icomfort

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) for the Lennox iComfort Thermostat implemented in Java Script.

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
    "gatewaySN": "SERIAL_NUMBER"
  }
```

## License
This work is licensed under the MIT license. See [license](LICENSE) for more details.

## Thanks
Thanks to [Daniel McQuiston](https://github.com/deHugo) for his [icomfort-js](https://github.com/deHugo/icomfort-js) repo which is used as the interface to the iComfort Thermostat.

