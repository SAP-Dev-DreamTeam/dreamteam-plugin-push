#import "AppDelegate+DreamTeamPushNotifications.h"
#import "DreamTeamPushNotifications.h"

@implementation AppDelegate (DreamTeamPushNotifications)

// Tells the delegate that the app successfully registered with Apple Push Notification service (APNs).
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(nonnull NSData *)deviceToken
{
    NSLog(@"App successfully registered with Apple Push Notification service.");
    
    DreamTeamPushNotifications *dreamTeamPushNotifications = [[DreamTeamPushNotifications alloc] init];

    // Start Device Registration with Azure Notification Hubs.

    [dreamTeamPushNotifications registerDeviceWithAzureNotificationHubs: deviceToken];
}

// Sent to the delegate when Apple Push Service cannot successfully complete the registration process.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    NSLog(@"Device Registration with APNS failed : %@", error);
}

// Tells the app that a remote notification arrived that indicates there is data to be fetched.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
    NSLog(@"App has received a remote notification.");
    
    // Update the app’s badge.
    [application setApplicationIconBadgeNumber:[[[userInfo objectForKey:@"aps"] objectForKey:@"badge"] intValue]];
    
    completionHandler(UIBackgroundFetchResultNoData);
}

@end
