//
//  AppDelegate.m
//
//  Created by Michael Schneider
//  Copyright © 2017 mischneider. All rights reserved.
//

#import "AppDelegate.h"

#import <React/RCTRootView.h>
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>

#import "MSREventBridge.h"

#pragma mark -
#pragma mark - MSREventBridgeBridgeManager

/**
 * RCTBridge to be used across the component to not have a hit if multiple RTCViews are there
 */
@interface MSREventBridgeBridgeManager : NSObject<RCTBridgeDelegate>

/**
 * Returns the shared instance of the bridge manager for react native navigation
 */
+ (instancetype)sharedInstance;

/**
 * Shared bridge used in the bridge manager
 */
@property (readonly) RCTBridge *bridge;

/**
 * Create a new view for a given module name and pass in initial properties
 */
- (RCTRootView *)viewForModuleName:(NSString *)moduleName initialProperties:(NSDictionary *)initialProps;

/**
 * Returns the root view for a given react tag. The react tag can be from a view that is within the view hierarchy
 */
- (void)rootViewForReactTag:(NSNumber *)reactTag withCompletion:(void (^)(UIView *view))completion;

@end

@implementation MSREventBridgeBridgeManager

#pragma mark Lifecycle

+ (instancetype)sharedInstance
{
    static dispatch_once_t once;
    static id sharedInstance;
    dispatch_once(&once, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

#pragma mark Bridge

- (RCTBridge *)bridge
{
    static RCTBridge *bridge = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
    });
    return bridge;
}

- (void)rootViewForReactTag:(NSNumber *)reactTag withCompletion:(void (^)(UIView *view))completion
{
  [self.bridge.uiManager rootViewForReactTag:reactTag withCompletion:completion];
}

- (RCTRootView *)viewForModuleName:(NSString *)moduleName initialProperties:(NSDictionary *)initialProps
        {
  return [[RCTRootView alloc] initWithBridge:self.bridge moduleName:moduleName initialProperties:initialProps];
}

#pragma mark RCTBridgeDelegate

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
}

@end

#pragma mark -
#pragma mark - UIViewController(MSREventBridgeModule)

@interface UIViewController (MSREventBridgeModule)

/**
 * Returns the event emitter to send events to the js components
 */
@property (nonatomic, readonly) id<MSREventBridgeEventEmitter> viewControllerEventEmitter;

@end

@implementation UIViewController (MSREventBridgeModule)

- (id<MSREventBridgeEventEmitter>)viewControllerEventEmitter
{
  return MSREventBridgeBridgeManager.sharedInstance.bridge.viewControllerEventEmitter;
}

@end

#pragma mark -
#pragma mark - ViewController

static NSString * const LearnMoreEvent = @"LearnMore";
static NSString * const LearnMoreEventCallback = @"EventWithCallback";
static NSString * const PresentScreenEvent = @"PresentScreen";
static NSString * const DismissScreenEvent = @"DismissScreen";
static NSString * const LoadDataEvent = @"LoadData";
static NSString * const LoadDataEventCountParameterKey = @"count";
static NSString * const DidSelectRowEvent = @"DidSelectRow";

@interface ViewController : UIViewController

@end

@interface ViewController () <MSREventBridgeEventReceiver>

// Some UUID to test out the event dispatching and receiving is working per view controller
@property (nonatomic) NSUUID *UUID;

@end

@implementation ViewController

#pragma mark - Lifecycle

- (instancetype)init
{
  self = [super init];
  if (self == nil) {
    return nil;
  }

  _UUID = [NSUUID UUID];

  return self;
}

- (void)loadView
{
  self.view = [[MSREventBridgeBridgeManager sharedInstance] viewForModuleName:@"EventBridgeExample" initialProperties:nil];
}

#pragma mark - <MSREventBridgeEventReceiver>

- (NSArray *)supportedEvents
{
  static NSArray *supportedEvents = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    supportedEvents = @[
      PresentScreenEvent,
      DismissScreenEvent,
      DidSelectRowEvent,
      LearnMoreEvent,
      LearnMoreEventCallback,
      LoadDataEvent
    ];
  });
  return supportedEvents;
}

// Callback from the JS side. One subview from the root node did send an event
- (BOOL)onEventWithName:(NSString *)eventName info:(NSDictionary *)info
{
  RCTLog(@"%@ - Received event: '%@', with info: %@", self.UUID.UUIDString, eventName, info);

  // Handle events dispatched from React Native

  // Example for PresentScreen event
  if ([eventName isEqualToString:PresentScreenEvent] ) {
    ViewController *newViewController = [ViewController new];
    [self presentViewController:newViewController animated:YES completion:nil];
    return YES;
  }

  // Example for DismissScreen event
  if ([eventName isEqualToString:DismissScreenEvent]) {
    [self dismissViewControllerAnimated:YES completion:nil];
    return YES;
  }

  // Example for DidSelectRow event
  if ([eventName isEqualToString:DidSelectRowEvent]) {
    RCTLog(@"Did Select Row With info: %@", info);
    
    // Send an event with name 'eventName' to listeners for this event within the React Native component hierarchy
    // of that is managed by this view controller
    [self.viewControllerEventEmitter emitEventForView:self.view name:@"eventName" info:@{
      @"rowSelected" : info[@"rowID"]
    }];
    return YES;
  }

  // After receiving an event send some event back with name `eventName`.
  [self.viewControllerEventEmitter emitEventForView:self.view name:@"eventName" info:@{
    @"UUID" : _UUID.UUIDString,
    @"data" : @"data"
  }];
  
  return YES;
}

- (BOOL)onEventWithName:(NSString *)eventName info:(NSDictionary *)info callback:(MSREventBridgeEventReceiverCallback)callback;
{
  RCTLog(@"%@ - Received event that expects callback: '%@', with info: %@", self.UUID.UUIDString, eventName, info);

  // Example for LoadData event
  if ([eventName isEqualToString:LoadDataEvent]) {

    // Get the count parameter from the LoadDataEvent
    NSNumber *count = info[LoadDataEventCountParameterKey];
    
    // Simulate some data fetching
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      NSMutableArray *responseData = [NSMutableArray array];
      for (int i = 0; i < count.integerValue; i++) {
        [responseData addObject:[NSString stringWithFormat:@"row %i", i]];
      }
      
      // Call callback with some error as first parameter if so and second with respnse data
      if (callback) {
        callback(nil, responseData);
      }
      
    });
    return YES;
  }

  // No special handling in this case just execute the callback for now
  if (callback) {
    callback(nil, nil);
    return YES;
  }
  
  return NO;
}

@end

#pragma mark -
#pragma mark - AppDelegate

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.rootViewController = [ViewController new];
  [self.window makeKeyAndVisible];
  return YES;
}

@end
