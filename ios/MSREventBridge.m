//
//  MSREventBridge.m
//
//  Created by Michael Schneider
//  Copyright © 2017 mischneider. All rights reserved.
//

#import "MSREventBridge.h"

#import <React/RCTUIManager.h>
#import <React/RCTLog.h>

#pragma mark -
#pragma mark - MSREventBridge

@interface MSREventBridge () <RCTBridgeModule>

@end

@implementation MSREventBridge

#pragma mark <MSREventBridge>

RCT_EXPORT_MODULE();

#pragma mark Queue

- (dispatch_queue_t)methodQueue
{
  // All events will be handled on the main thread
  return dispatch_get_main_queue();
}

#pragma mark Receive Events

RCT_EXPORT_METHOD(onEvent:(nonnull NSNumber *)reactTag name:(NSString *)name info:(NSDictionary *)info)
{
  [self.bridge.uiManager rootViewForReactTag:reactTag withCompletion:^(UIView *rootView) {
    // Check if root view can receive the event
    if ([rootView conformsToProtocol:@protocol(MSREventBridgeEventReceiver)]
        && [rootView respondsToSelector:@selector(onEventWithName:info:)]) {
      NSArray *supportedEvents = [(id<MSREventBridgeEventReceiver>)rootView supportedEvents];
      if ([supportedEvents containsObject:name]) {
        BOOL handled = [(id<MSREventBridgeEventReceiver>)rootView onEventWithName:name info:info];
        NSAssert(handled, @"Event supported but not handled: <name: %@, info:%@>",name, info);
      }
    }
    
    // Check if the view controller of the root view can receive the event
    UIViewController *viewController = rootView.reactViewController;
    if ([viewController conformsToProtocol:@protocol(MSREventBridgeEventReceiver)]
        && [viewController respondsToSelector:@selector(onEventWithName:info:)]) {
      NSArray *supportedEvents = [(id<MSREventBridgeEventReceiver>)viewController supportedEvents];
      if ([supportedEvents containsObject:name]) {
        BOOL handled = [(id<MSREventBridgeEventReceiver>)viewController onEventWithName:name info:info];
        NSAssert(handled, @"Event supported but not handled: <name: %@, info:%@>",name, info);
      }
    }
  }];
}

RCT_EXPORT_METHOD(onEventCallback:(nonnull NSNumber *)reactTag name:(NSString *)name info:(NSDictionary *)info callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager rootViewForReactTag:reactTag withCompletion:^(UIView *rootView) {
    // Check if root view can receive the event
    if ([rootView conformsToProtocol:@protocol(MSREventBridgeEventReceiver)]
        && [rootView respondsToSelector:@selector(onEventWithName:info:callback:)]) {
        NSArray *supportedEvents = [(id<MSREventBridgeEventReceiver>)rootView supportedEvents];
        if ([supportedEvents containsObject:name]) {
          BOOL handled = [(id<MSREventBridgeEventReceiver>)rootView onEventWithName:name info:info callback:^(NSError *error, id data) {
            callback(@[(error ?: [NSNull null]), (data ?: [NSNull null])]);
          }];
          NSAssert(handled, @"Event supported but not handled: <name: %@, info:%@>",name, info);
        }
    } else {
      // Check if the view controller of the root view can receive the event
      UIViewController *viewController = rootView.reactViewController;
      if ([viewController conformsToProtocol:@protocol(MSREventBridgeEventReceiver)]
          && [viewController respondsToSelector:@selector(onEventWithName:info:callback:)]) {
        NSArray *supportedEvents = [(id<MSREventBridgeEventReceiver>)viewController supportedEvents];
        if ([supportedEvents containsObject:name]) {
          BOOL handled = [(id<MSREventBridgeEventReceiver>)viewController onEventWithName:name info:info callback:^(NSError *error, id data) {
            callback(@[(error ?: [NSNull null]), (data ?: [NSNull null])]);
          }];
          NSAssert(handled, @"Event supported but not handled: <name: %@, info:%@>",name, info);
        }
      }
    }
  }];
}

#pragma mark Emit Events

// Static Identifier for events that are sent to React Native. These needs to be in sync with Android!
static NSString * const MSREventBridgeModuleEventName = @"MSREventBridgeModuleEvent";
static NSString * const MSREventBridgeModuleEventReactTagKey = @"reactTag";
static NSString * const MSREventBridgeModuleEventNameKey = @"eventName";
static NSString * const MSREventBridgeModuleEventInfoKey = @"info";

// We export the the event name to have a constant in React Native
- (NSDictionary *)constantsToExport
{
  return @{
    @"EventName": MSREventBridgeModuleEventName,
    @"EventReactTagKey" : MSREventBridgeModuleEventReactTagKey,
    @"EventNameKey" : MSREventBridgeModuleEventNameKey,
    @"EventInfoKey" : MSREventBridgeModuleEventInfoKey
  };
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[MSREventBridgeModuleEventName];
}

- (void)emitEventWithName:(NSString *)name info:(NSDictionary *)info
{
  [self sendEventWithName:MSREventBridgeModuleEventName body:@{
    MSREventBridgeModuleEventNameKey : name,
    MSREventBridgeModuleEventInfoKey : info
  }];
}

- (void)emitEventForView:(UIView *)view name:(NSString *)name info:(NSDictionary *)info
{
  // Emit an event to a component that is within the view hierarchy of the root view. Therefore use
  // the root view's react tag as identifier
  UIView *rootView = view;
  while (rootView.superview && ![rootView isKindOfClass:RCTRootView.class]) {
    rootView = rootView.superview;
  }
  
  NSAssert([rootView isKindOfClass:RCTRootView.class], @"Events send to a specific view needs to be of kind RCTRootView");
  
  [self sendEventWithName:MSREventBridgeModuleEventName body:@{
    MSREventBridgeModuleEventReactTagKey : rootView.reactTag,
    MSREventBridgeModuleEventNameKey : name,
    MSREventBridgeModuleEventInfoKey : info
  }];
}

@end

#pragma mark -
#pragma mark - RCTBridge (MSREventBridgeModule)

@implementation RCTBridge (MSREventBridgeModule)

- (id<MSREventBridgeEventEmitter>)viewControllerEventEmitter
{
  return [self moduleForClass:[MSREventBridge class]];
}

@end
