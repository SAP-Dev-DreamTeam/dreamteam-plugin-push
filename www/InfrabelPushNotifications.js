/* 
Plugin Dependencies:
    Application Preferences Plugin (kapsel-plugin-apppreferences)
    https://help.sap.com/doc/acbf025f18854e63a7f3bf20038356c8/3.1/en-US/api/sap.AppPreferences.html
    Logon Plugin (kapsel-plugin-logon)
    https://help.sap.com/doc/acbf025f18854e63a7f3bf20038356c8/3.1/en-US/api/sap.Logon.Core.html
    Push Notification Plugin (kapsel-plugin-push)
    https://help.sap.com/doc/acbf025f18854e63a7f3bf20038356c8/3.1/en-US/api/sap.Push.html
*/

const exec = require('cordova/exec');

const TAG = "DREAMTEAM_PUSHNOTIFICATIONS";

let DreamTeamPushNotifications = function () {
    this._oSettings = null;
};

// Retrieve settings from the Custom SAP Fiori Client configuration.
// https://help.sap.com/doc/saphelp_smp3010sdkmfadev/3.0.10/en-US/44/469c081dc14eb8baed4ce732d6f5b8/frameset.htm
DreamTeamPushNotifications.prototype._getSettings = function () {
    return new Promise(function (resolve, reject) {
        const aSettings = [
            "notificationHubPath",
            "connectionString"
        ];

        if (this._oSettings && 
            this._oSettings.notificationHubPath && 
            this._oSettings.connectionString) {
            
            resolve(this._oSettings);
        }

        if (window["sap"] && sap.AppPreferences) {
            // https://help.sap.com/doc/acbf025f18854e63a7f3bf20038356c8/3.1/en-US/api/sap.AppPreferences.html
            sap.AppPreferences.getPreferenceValues(aSettings,
                function successCallback(oSettings) {
                    if (oSettings && 
                        oSettings.notificationHubPath && 
                        oSettings.connectionString) {
                        
                        this._oSettings = {
                            "notificationHubPath": oSettings.notificationHubPath,
                            "connectionString": oSettings.connectionString
                        };

                        resolve(this._oSettings);
                    } else {
                        reject("An error occurs while retrieving preference values with keys!");
                    }
                }.bind(this), reject);
        } else {
            reject("Kapsel Application Preferences Plugin is not available!");
        }
    }.bind(this));
};

DreamTeamPushNotifications.prototype.registerDevice = function () {
    const sServiceName = "DreamTeamPushNotifications";

    const sActionName = "registerDevice";

    return new Promise(function (resolve, reject) {
        if (window["sap"] && sap.ushell && sap.ushell.Container) {
            // https://sapui5.hana.ondemand.com/#/api/sap.ushell.services.UserInfo
            // The Unified Shell's user information service, which allows you to retrieve information about the logged-in user.
            const oUserInfo = sap.ushell.Container.getService("UserInfo");

            if (!!oUserInfo) {
                // Returns the id of the user.
                const sUserId = oUserInfo.getId().toUpperCase();

                if (!!sUserId) {
                    this._getSettings()
                        .then(function onFulfilled(oSettings) {
                            const aArguments = [
                                sUserId,
                                oSettings.notificationHubPath,
                                oSettings.connectionString
                            ];

                            // https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/#the-javascript-interface
                            exec(function successCallback() {
                                sap.Logger.debug("Action '" + sActionName + "' from Service '" + sServiceName + "' succeeded.", TAG);

                                resolve();
                            }, function errorCallback(oError) {
                                sap.Logger.error("Action '" + sActionName + "' from Service '" + sServiceName + "' failed!", TAG);

                                reject(JSON.stringify(oError));
                            }, sServiceName, sActionName, aArguments);
                        }.bind(this), reject);
                } else {
                    reject("Failed to retrieve the id of the user!");
                }
            } else {
                reject("Information about the logged-in user is unavailable!");
            }
        } else {
            reject("The Unified Shell container is not available!");
        }
    }.bind(this));
};

DreamTeamPushNotifications.prototype.unregisterDevice = function () {
    const sServiceName = "DreamTeamPushNotifications";

    const sActionName = "unRegisterDevice";

    return new Promise(function (resolve, reject) {
        this._getSettings()
            .then(function onFulfilled(oSettings) {
                const aArguments = [
                    oSettings.notificationHubPath,
                    oSettings.connectionString
                ];

                // https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/#the-javascript-interface
                exec(function successCallback() {
                    sap.Logger.debug("Action '" + sActionName + "' from Service '" + sServiceName + "' succeeded.", TAG);

                    resolve();
                }, function errorCallback(oError) {
                    sap.Logger.error("Action '" + sActionName + "' from Service '" + sServiceName + "' failed!", TAG);

                    reject(JSON.stringify(oError));
                }, sServiceName, sActionName, aArguments);
            }.bind(this), reject);
    }.bind(this));

};

module.exports = new DreamTeamPushNotifications();

/*
SAP Fiori Client extension.
*/

// Fired by the SAP Fiori Client when the logon succeeded.
document.addEventListener("onSapLogonSuccess", function () {
    // Start Device Registration.
    dreamTeam.PushNotifications.registerDevice()
        .then(function onFulfilled() {
            sap.Logger.debug("Notification Hubs Registration succeeded.", TAG);
        }, function onRejected(sError) {
            sap.Logger.error(sError, TAG);

            sap.Logger.error("Notification Hubs Registration failed.", TAG);
        });
}, false);

// Extend Kapsel Logon Plugin: unregister from Azure Notification Hubs before deleting the APNS registration.
// https://help.sap.com/doc/3f9b228508c8481798df1ea12b8d99a6/3.0.15/en-US/api/sap.Logon.Core.html
if (window["sap"] && sap.logon && sap.logon.Core) {
    const deleteRegistration = sap.logon.Core.deleteRegistration;

    sap.logon.Core.deleteRegistration = function (successCallback, errorCallback) {
        // Start Device Unregistration from Azure Notification Hubs.
        dreamTeam.PushNotifications.unregisterDevice()
            .then(function onFulfilled() {
                sap.Logger.debug("Notification Hubs Unregistration succeeded.", TAG);

                deleteRegistration.call(null, successCallback, errorCallback);
            }, function onRejected(sError) {
                sap.Logger.error(sError, TAG);

                sap.Logger.error("Notification Hubs Unregistration failed.", TAG);
            });
    };
} else {
    console.log("Kapsel Logon Plugin is not available!");
}

// Extend Kapsel Push Notification Plugin: provide an empty RegisterSuccess callback.
if (window["sap"] && sap.Push) {
    sap.Push.RegisterSuccess = function () { return; };
} else {
    console.log("Kapsel Push Notification Plugin is not available!");
}