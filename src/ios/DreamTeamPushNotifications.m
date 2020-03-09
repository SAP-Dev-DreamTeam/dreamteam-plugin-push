#import "DreamTeamPushNotifications.h"

@implementation DreamTeamPushNotifications

static NSString *userId;
+ (NSString *) userId
{ @synchronized(self) { return userId; } }
+ (void) setUserId:(NSString *)value
{ @synchronized(self) { userId = value; } }

static NSString *notificationHubPath;
+ (NSString *) notificationHubPath
{ @synchronized(self) { return notificationHubPath; } }
+ (void) setNotificationHubPath:(NSString *)value
{ @synchronized(self) { notificationHubPath = value; } }

static NSString *connectionString;
+ (NSString *) connectionString
{ @synchronized(self) { return connectionString; } }
+ (void) setConnectionString:(NSString *)value
{ @synchronized(self) { connectionString = value; } }

// Called from an event handler defined in the DreamTeamPushNotifications plugin when 'onSapLogonSuccess' is fired.
// 1. Start Device Registration.
- (void)registerDevice:(CDVInvokedUrlCommand *)command {
    NSLog(@"Starting Device Registration...");

    // 1.1 Retrieve the FLP User Id and Azure Notification Hubs settings.
    DreamTeamPushNotifications.userId = command.arguments[0];

    DreamTeamPushNotifications.notificationHubPath = command.arguments[1];

    DreamTeamPushNotifications.connectionString = command.arguments[2];

    // 1.2 Register Device with APNS.
    [self registerDeviceWithAPNS];

    // 1.3 Send Plugin Result.
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Device Registration completed."];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
          
    NSLog(@"Device Registration completed.");
}

// 2. Register Device with Apple Push Notification service.
- (void)registerDeviceWithAPNS {
    NSLog(@"Starting Device Registration with APNS...");

    // 2.1 Requests authorization to interact with the user.
    UNUserNotificationCenter *notificationCenter = [UNUserNotificationCenter currentNotificationCenter];

    UNAuthorizationOptions options =  UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;

    [notificationCenter requestAuthorizationWithOptions:(options) completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"Failed to requests authorization to interact with the user: %@", error);
        }
    }];

    // 2.2 Register to receive remote notifications via Apple Push Notification service.
    [[UIApplication sharedApplication] registerForRemoteNotifications];
        
    NSLog(@"Device registration with APNS completed.");
}

// Called from didRegisterForRemoteNotificationsWithDeviceToken.
// 3. Register device with Azure Notification Hubs.
- (void)registerDeviceWithAzureNotificationHubs:(NSData *)deviceToken {
    NSLog(@"Starting Device Registration with Azure Notification Hubs...");
    
    // 3.1 Add User Id to tags.
    NSMutableSet *tags = [[NSMutableSet alloc] init];

    [tags addObject:DreamTeamPushNotifications.userId];
    
    // 3.2 Register the device with the Notification Hub.
    SBNotificationHub* notificationHub = [[SBNotificationHub alloc] initWithConnectionString:DreamTeamPushNotifications.connectionString notificationHubPath:DreamTeamPushNotifications.notificationHubPath];

    [notificationHub registerNativeWithDeviceToken:deviceToken tags:tags completion:^(NSError* error) {
        if (error != nil) {
            NSLog(@"Failed to register to receive remote notifications: %@", error);
        }
    }];
    
    NSLog(@"Device registration with Azure Notification Hubs completed.");
}

// Called from the extended Logon plugin when deleting the registration.
// 4. Start Device Unregistration from Azure Notification Hubs.
- (void)unRegisterDevice:(CDVInvokedUrlCommand *)command {
    NSLog(@"Starting Device Unregistration from Azure Notification Hubs...");
    
    // 4.1 Retrieve the Azure Notification Hubs settings.
    DreamTeamPushNotifications.notificationHubPath = command.arguments[0];
    
    DreamTeamPushNotifications.connectionString = command.arguments[1];
    
    // 4.2 Unregister the device from the Notification Hub.
    SBNotificationHub *notificationHub = [[SBNotificationHub alloc] initWithConnectionString:DreamTeamPushNotifications.connectionString notificationHubPath:DreamTeamPushNotifications.notificationHubPath];
    
    [notificationHub unregisterNativeWithCompletion:^(NSError* error) {
        if (error != nil) {
            NSLog(@"Failed to unregister for native notififications: %@", error);
        }
    }];

    // 4.3 Send Plugin Result.
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Device unregistration completed."];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
    NSLog(@"Device Unregistration from Azure Notification Hubs completed.");
}

@end
