//
//  MSREventBridge.h
//
//  Created by Michael Schneider
//  Copyright © 2017 mischneider. All rights reserved.
//

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#endif

NS_ASSUME_NONNULL_BEGIN

@class RCTBridge;
@class RCTRootView;

#pragma mark -
#pragma mark - Protocols

#pragma mark MSREventBridgeEventEmitter

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

#pragma mark MSREventBridgeEventReceiver

typedef void (^MSREventBridgeEventReceiverCallback)(NSError * _Nullable error, id _Nullable data);

/**
 * Handler that receive events posted from a subcomponent. Usually this protocol is implemented by a
 * RTCRootView subclass or an UIViewController that has an RCTRootView as view.
 */
@protocol MSREventBridgeEventReceiver <NSObject>

/**
 * Return an array of supported events.
 */
- (NSArray<NSString *> *)supportedEvents;

@optional

/**
 * Handle event received from React Native. Return YES if the event will be handled, otherwise if the event will not
 * be handled an assertion will happen in development.
 */
- (BOOL)onEventWithName:(NSString *)name info:(nullable NSDictionary *)info;

/**
 * Event received from React Native. The callback must be called. Return YES if the event will be handled, otherwise if
 * the event will not be handled an assertion will happen in development.
 */
- (BOOL)onEventWithName:(NSString *)name info:(nullable  NSDictionary *)info callback:(nullable MSREventBridgeEventReceiverCallback)callback;

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

NS_ASSUME_NONNULL_END
