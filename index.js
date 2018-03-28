//    {
//      "accessory": "iComfortThermostat",
//      "name": "Thermostat",
//      "username": "USERNAME",
//      "password": "PASSWORD",
//      "gatewaySN": "SERIAL_NUMBER",
//	"zoneNumber": 0
//    }

var inherits = require('util').inherits;
var Service, Characteristic, uuid, Away;
var icomfort = require("icomfort");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  uuid = homebridge.hap.uuid;

  Away = function () {
	Characteristic.call(this, 'Away', 'D6D47D29-4638-4F44-B53C-D84015DAEBDB');
	this.setProps({
	  format: Characteristic.Formats.BOOL,
	  perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
	});
	this.value = this.getDefaultValue();
  };
  inherits(Away, Characteristic);

  const exportedTypes = {
	Service: Service,
	Characteristic: Characteristic,
	uuid: uuid,
	Away: Away
  };

  homebridge.registerAccessory("homebridge-icomfort", "iComfortThermostat", Thermostat);
};

function Thermostat(log, config) {
	this.log = log;
        this.name = config.name;
        this.username = config.username;
        this.password = config.password;
        this.gatewaySN = config.gatewaySN;
	this.zoneNumber = config.zoneNumber || 0;

        this.temperatureDisplayUnits = 0; //FARENHEIT iComfort is inverse of the TemperatureDisplayUnits characteristic 
	this.temperatureUnits = 0;
	this.currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
	this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;
	this.currentTemperature = 70;
	this.targetTemperature = 72;
	this.currentRelativeHumidity = 0.55;
	this.coolingThresholdTemperature = 87;
	this.heatingThresholdTemperature = 60;
	this.awayMode = 0;

	this.newCoolingTemp = 77;
	this.newHeatingTemp = 66;

        this.icomfort = new icomfort({username: this.username, password: this.password});
	this.service = new Service.Thermostat(this.name);
}

Thermostat.prototype = {
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	// Custom Characteristic
	getAwayMode: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
                if (currentSettings.Away_Mode === 0) {
                  this.awayMode = 0;
                } else if (currentSettings.Away_Mode === 1) {
                  this.awayMode = 1;
                }
                this.log("getAwayMode:" + this.awayMode);
                callback(null, this.awayMode);
                });
	},
	setAwayMode: function(value, callback) {
		var newOptions;
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);

        	const currentAwayMode = {
	            'awaymode': currentSettings.Away_Mode,
	            'coolsetpoint': currentSettings.Cool_Set_Point,
	            'fanmode': currentSettings.Fan_Mode,
	            'gatewaysn': currentSettings.GatewaySN,
	            'heatsetpoint': currentSettings.Heat_Set_Point,
	            'zonenumber': currentSettings.Zone_Number
	       	};

                if (value === false) {
                  newOptions = {
                    'awaymode': 0 
                  };
                } else if (value === true) {
                  newOptions = {
                    'awaymode': 1
                  };
                }

	        const newSettings = Object.assign({}, currentAwayMode, newOptions);
	        this.icomfort.setAwayMode(newSettings);
		this.log("setAwayMode: " + newSettings.awaymode);
		callback(null);
		});
	},
	// Required Characteristics
	getCurrentHeatingCoolingState: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
	        if (currentSettings.System_Status === 0) {
	          this.currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
	        } else if (currentSettings.System_Status === 1) {
	          this.currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.HEAT;
	        } else if (currentSettings.System_Status === 2) {
	          this.currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.COOL;
	        }
                this.log("getCurrentHeatingCoolingState: " + this.currentHeatingCoolingState);
                callback(null,this.currentHeatingCoolingState);
                });
	},
	getTargetHeatingCoolingState: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                if (currentSettings.Operation_Mode === 0) {
                  this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;
                } else if (currentSettings.Operation_Mode === 1) {
                  this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.HEAT;
                } else if (currentSettings.Operation_Mode === 2) {
                  this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.COOL;
                } else if (currentSettings.Operation_Mode === 3) {
		  this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
		}
                this.log("getTargetHeatingCoolingState: " + this.targetHeatingCoolingState);
                callback(null,this.targetHeatingCoolingState);
                });
	},
	setTargetHeatingCoolingState: function(value, callback) {
                var newOptions;
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                if (value === 0) {
                  newOptions = {
                    Operation_Mode: 0 
                  };
                } else if (value === 1) {
                  newOptions = {
                    Operation_Mode: 1 
                  };
                } else if (value === 2) {
                  newOptions = {
                    Operation_Mode: 2
                  };
                } else if (value === 3) {
                  newOptions = {
                    Operation_Mode: 3
                  };
                }
                const newSettings = Object.assign({}, currentSettings, newOptions);
                this.icomfort.setThermostatInfo(newSettings);
		this.log("setTargetHeatingCoolingState-OperationMode: " + newSettings.Operation_Mode);
		callback(null);
		});
	},
	getCurrentTemperature: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                this.currentTemperature = currentSettings.Indoor_Temp;
		this.log("getCurrentTemperature: " + this.currentTemperature);
                callback(null,fToC(this.currentTemperature));
                });
	},
	getTargetTemperature: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                if (currentSettings.Operation_Mode === 0) {
                  this.targetTemperature = currentSettings.Cool_Set_Point;
                } else if (currentSettings.Operation_Mode === 1) {
                  this.targetTemperature = currentSettings.Heat_Set_Point;
                } else if (currentSettings.Operation_Mode === 2) {
                  this.targetTemperature = currentSettings.Cool_Set_Point;
                } else if (currentSettings.Operation_Mode === 3) {
		  this.targetTemperature = currentSettings.Heat_Set_Point + (currentSettings.Cool_Set_Point - currentSettings.Heat_Set_Point) / 2;
		}
                this.log("getTargetTemperature: " + this.targetTemperature);
                callback(null,fToC(this.targetTemperature));
                });
	},
	setTargetTemperature: function(value,callback) {
                var newOptions;
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                if (currentSettings.Operation_Mode === 0) {
                  newOptions = {
                    Cool_Set_Point: cToF(value)
                  };
                } else if (currentSettings.Operation_Mode === 1) {
                  newOptions = {
                    Heat_Set_Point: cToF(value)
                  };
                } else if (currentSettings.Operation_Mode === 2) {
                  newOptions = {
                    Cool_Set_Point: cToF(value)
                  };
		} 
                const newSettings = Object.assign({}, currentSettings, newOptions);
                this.icomfort.setThermostatInfo(newSettings);
                this.log("setTargetTemperature: " + newSettings.Operation_Mode + " : " + cToF(value));
		callback(null);
		});
	},
        getTemperatureDisplayUnits: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                if (currentSettings.Pref_Temp_Units === "0") { //lennox FARENHEIT
		  this.temperatureDisplayUnits = 1;
                } else if (currentSettings.Pref_Temp_Units === "1") { //lennox CELSIUS
                  this.temperatureDisplayUnits = 0;
		}
                this.log("getTemperatureDisplayUnits:" + this.temperatureDisplayUnits); 
                callback(null, this.temperatureDisplayUnits); 
		});
        },
	// Currently doesn't work 
        setTemperatureDisplayUnits: function(value, callback) {
                var newOptions;
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber); 
                if (value === 0) { 
		  newOptions = {
		    Pref_Temp_Units: "1"
		  }; 
                } else if (value === 1) { 
		  newOptions = {
		    Pref_Temp_Units: "0"
		  };
                }
                const newSettings = Object.assign({}, currentSettings, newOptions);
                this.icomfort.setThermostatInfo(newSettings);
                this.log("setTemperatureDisplayUnits: " + newSettings.Pref_Temp_Units);
                callback(null);
                });
        },

	// Optional Characteristics
	getCurrentRelativeHumidity: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
                this.currentRelativeHumidity = currentSettings.Indoor_Humidity;
                this.log("getCurrentRelativeHumidity: " + this.currentRelativeHumidity);
                callback(null,this.currentRelativeHumidity);
                });
	},
	getCoolingThresholdTemperature: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
		this.coolingThresholdTemperature = currentSettings.Cool_Set_Point;
                this.log("getCoolingThresholdTemperature: " + this.coolingThresholdTemperature);
                callback(null,fToC(this.coolingThresholdTemperature));
                });
	},
        setCoolingThresholdTemperature: function(value, callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
        	this.newCoolingTemp = cToF(value);
                const newOptions = {
                  Cool_Set_Point: this.newCoolingTemp,
		  Heat_Set_Point: this.newHeatingTemp
                };
                const newSettings = Object.assign({}, currentSettings, newOptions);
                this.icomfort.setThermostatInfo(newSettings);
                this.log("setCoolingThresholdTemperature: " + this.newCoolingTemp);
                callback(null);
                });
        },
	getHeatingThresholdTemperature: function(callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
                this.heatingThresholdTemperature = currentSettings.Heat_Set_Point;
                this.log("getHeatingThresholdTemperature: " + this.heatingThresholdTemperature);
                callback(null,fToC(this.heatingThresholdTemperature));
                });
	},
        setHeatingThresholdTemperature: function(value, callback) {
                this.icomfort.getThermostatInfoList({GatewaySN: this.gatewaySN, TempUnit: this.temperatureUnits})
                  .then(res => {
                    var currentSettings = res.tStatInfo.find(tStat => tStat.Zone_Number === this.zoneNumber);
                this.newHeatingTemp = cToF(value);

                const newOptions = {
                  Cool_Set_Point: this.newCoolingTemp,
                  Heat_Set_Point: this.newHeatingTemp
                };
                const newSettings = Object.assign({}, currentSettings, newOptions);
                this.icomfort.setThermostatInfo(newSettings);
                this.log("setHeatingThresholdTemperature: " + this.newHeatingTemp);
                callback(null);
                });
        },
	getName: function(callback) {
		this.log("getName :" + this.name);
		callback(null, this.name);
	},

	getServices: function() {
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Lennox")
			.setCharacteristic(Characteristic.Model, "iComfort")
			.setCharacteristic(Characteristic.SerialNumber, "Serial Number");

		// Custom Characteristic
		this.service
			.addCharacteristic(Away)
			.on('get', this.getAwayMode.bind(this))
			.on('set', this.setAwayMode.bind(this));

		// Required Characteristics
		this.service
			.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
			.on('get', this.getCurrentHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetHeatingCoolingState)
			.on('get', this.getTargetHeatingCoolingState.bind(this))
			.on('set', this.setTargetHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', this.getCurrentTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetTemperature)
			.on('get', this.getTargetTemperature.bind(this))
			.on('set', this.setTargetTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.TemperatureDisplayUnits)
			.on('get', this.getTemperatureDisplayUnits.bind(this))
			.on('set', this.setTemperatureDisplayUnits.bind(this));

		// Optional Characteristics
		this.service
			.getCharacteristic(Characteristic.CurrentRelativeHumidity)
			.on('get', this.getCurrentRelativeHumidity.bind(this));

		this.service
			.getCharacteristic(Characteristic.CoolingThresholdTemperature)
			.on('get', this.getCoolingThresholdTemperature.bind(this))
			.on('set', this.setCoolingThresholdTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.HeatingThresholdTemperature)
			.on('get', this.getHeatingThresholdTemperature.bind(this))
			.on('set', this.setHeatingThresholdTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

		this.service
			.getCharacteristic(Characteristic.HeatingThresholdTemperature)
			.setProps({
				minValue: 16,
				maxValue: 31,
				minStep: .1 
			});
		this.service
			.getCharacteristic(Characteristic.CoolingThresholdTemperature)
			.setProps({
                                minValue: 16,
                                maxValue: 31,
				minStep: .1 
			});
                this.service
                        .getCharacteristic(Characteristic.CurrentTemperature)
                        .setProps({
                                minValue: 16,
                                maxValue: 31,
                                minStep: .1
                        });
                this.service
                        .getCharacteristic(Characteristic.TargetTemperature)
                        .setProps({
                                minValue: 16,
                                maxValue: 31,
                                minStep: .1
                        });

		return [informationService, this.service];
	}
}

// function to convert Celcius to Farenheit
function cToF(celsius) {
  return celsius * 9 / 5 + 32;
}

// function to convert Farenheit to Celcius
function fToC(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}
