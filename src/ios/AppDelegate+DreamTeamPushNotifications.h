#import "AppDelegate.h"

@interface AppDelegate (DreamTeamPushNotifications)

// Tells the delegate that the app successfully registered with Apple Push Notification service (APNs).
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

// Sent to the delegate when Apple Push Service cannot successfully complete the registration process.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;

// Tells the app that a remote notification arrived that indicates there is data to be fetched.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler;

@end
