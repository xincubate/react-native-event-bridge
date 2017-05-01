//
//  MSREventBridge.h
//
//  Created by Michael Schneider
//  Copyright © 2017 mischneider. All rights reserved.
//


#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#endif

@class RCTBridge;
@class RCTRootView;

#pragma mark -
#pragma mark - Protocols

/**
 * Emitter to send events to React Native
 */
@protocol MSREventBridgeEventEmitter <NSObject>

/**
 * Post an event to all event subscriber for the given name
 */
- (void)emitEventWithName:(NSString *)name info:(NSDictionary *)info;

/**
 * Emits and event to a an event subscriber within a component that lives within the components tree
 * managed by the passed view
 */
- (void)emitEventForView:(UIView *)view name:(NSString *)name info:(NSDictionary *)info;

@end

/**
 * Handler that receive events posted from a subcomponent. Usually this protocol is implemented by a
 * RTCRootView subclass or an UIViewController that has an RCTRootView as view.
 */
@protocol MSREventBridgeEventReceiver <NSObject>

@optional

/**
 * Event received from React Native
 */
- (void)onEventWithName:(NSString *)name info:(NSDictionary *)info;

/**
 * Event received from React Native. The callback must be called.
 */
- (void)onEventWithName:(NSString *)name info:(NSDictionary *)info callback:(RCTResponseSenderBlock)callback;

@end

#pragma mark -
#pragma mark MSREventBridgeModule

/**
 * Send and Receive events between React Native and native.
 */
@interface MSREventBridge : RCTEventEmitter<MSREventBridgeEventEmitter>

@end

#pragma mark -
#pragma mark - RCTBridge(MSREventBridgeModule)

@interface RCTBridge (MSREventBridgeModule)

/**
 * Returns the event emitter for the view controller to emit events to React Native
 */
@property (nonatomic, readonly) id<MSREventBridgeEventEmitter> viewControllerEventEmitter;

@end
