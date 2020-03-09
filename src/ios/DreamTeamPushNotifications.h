@import Foundation;
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import <UserNotifications/UserNotifications.h>
#import <WindowsAzureMessaging/WindowsAzureMessaging.h>

@interface DreamTeamPushNotifications : CDVPlugin

// SAP Fiori Launchpad User Id.
+ (NSString *) userId;
+ (void)setUserId:(NSString *)value;

// Azure Notification Hubs settings.
+ (NSString *)notificationHubPath;
+ (void)setNotificationHubPath:(NSString *)value;
+ (NSString *)connectionString;
+ (void)setConnectionString:(NSString *)value;

// Called from an event handler defined in the DreamTeamPushNotifications plugin when 'onSapLogonSuccess' is fired.
- (void)registerDevice:(CDVInvokedUrlCommand *)command;

// Register Device with Apple Push Notification service.
- (void)registerDeviceWithAPNS;

// Called from didRegisterForRemoteNotificationsWithDeviceToken. Register device with Azure Notification Hubs.
- (void)registerDeviceWithAzureNotificationHubs:(NSData *)deviceToken;

// Called from the extended Logon plugin when deleting the registration.
- (void)unRegisterDevice:(CDVInvokedUrlCommand *)command;

@end
