# DreamTeamPushNotifications
Extend Custom SAP Fiori Client for iOS apps to use Azure Notification Hubs 

Please follow Azure Notification Hubs Documentation:
https://docs.microsoft.com/en-us/azure/notification-hubs/


Custom Fiori Client:

Build with SAP Cloud for iOS: 

- Add DreamTeamPushNotifications plugin ( WebID > Mobile > Select Cordova Plugins )

- Remove Kapsel Push plugin on build ( WebID > Mobile > Build Custom Fiori Client App )   


Build with SMP SDK for iOS: 

- Add DreamTeamPushNotifications plugin using cordova command line

- Remove Kapsel Push plugin using cordova command line


Set the following properties in Fiori Client appConfig.js before build (fiori_client_appConfig): 

- Azure Notification Hub Path: "notificationHubPath"

- Azure Connection String: "connectionString"