/**
 * EventBrige
 * @flow
 */

// Native Event Bridge
// Wrapper around sending and receieving events that are related to components
// and view hierarchy of a root view

import React from 'react';
import {
  findNodeHandle,
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';
import invariant from 'invariant';

import enhanceForEventsSupport, {
  enhanceForEventsSupportDecorator,
  enhanceForEventsSupportEnhanced,
} from './react-native-event-bridge-enhance';

const { MSREventBridge } = NativeModules;

// The react tag of the component acts as identifier to native. The native
// side will figure out the root view and dispatches it either to
// view / view controller or activity

// Emit an event to the native side
const emitEvent = (
  component: React.Component<any, any, any>,
  eventName: string,
  info: any
) => {
  let reactTag;
  try {
    reactTag = findNodeHandle(component);
  } catch (err) {
    return;
  }

  MSREventBridge.onEvent(reactTag, eventName, info);
};

// Emit an event to the native side and expect a callback
const emitEventCallback = (
  component: React.Component<any, any, any>,
  eventName: string,
  info: any,
  callback: (Array<any>) => void
): void => {
  let reactTag;
  try {
    reactTag = findNodeHandle(component);
  } catch (err) {
    return;
  }

  MSREventBridge.onEventCallback(reactTag, eventName, info, callback);
};

// Event emitter to be able to emit events from the JavaScript side to native
const MSREventBridgeEventEmitter = new NativeEventEmitter(MSREventBridge);
const addEventListener = (
  component: React.Component<any, any, any>,
  callback: (string, any) => void
): EmitterSubscription => {
  // Every component that would like to receive an event to native needs to have
  // a rootTag in it's context otherwise it would not be possible to identify
  // to which callback the event should be dispatched
  const componentReactTag = component.context.rootTag;
  invariant(
    componentReactTag != null,
    'If you would like receive events you have to define the reactTag in your contexts. Component: %s',
    component.constructor.name
  );

  return MSREventBridgeEventEmitter.addListener(
    MSREventBridge.EventName,
    (body: any) => {
      // Check if this event was directed to this subscritpion
      const eventReactTag = body[MSREventBridge.EventReactTagKey];

      // Check for react tag the same as the react tag passed in and dispatched to
      // this means it was from the root node
      if (componentReactTag !== eventReactTag) {
        return;
      }

      // Let callback know about the event
      const eventName = body[MSREventBridge.EventNameKey];
      const eventInfo = body[MSREventBridge.EventInfoKey];
      callback(eventName, eventInfo);
    }
  );
};

// Main handler that combines add a listener or emitting events from and to the
// native side
const EventBridge = {
  // Add a listener for events that are dispatched from the native side
  // It returns a EmitterSubscription you should store in your component and
  // remove the component will unmount
  addEventListener: (
    component: React.Component<any, any, any>,
    callback: any => void
  ): EmitterSubscription => addEventListener(component, callback),

  // Emit an event to the native side
  emitEvent: (
    component: React.Component<any, any, any>,
    eventName: string,
    info: any
  ): void => {
    emitEvent(component, eventName, info);
  },

  // Emit an event to the native side and expect a callback
  emitEventCallback: (
    component: React.Component<any, any, any>,
    eventName: string,
    callback: (Array<any>) => void
  ): void => {
    emitEventCallback(component, eventName, null, callback);
  },

  // Emit an event to the native side and expect a callback
  emitEventInfoCallback: (
    component: React.Component<any, any, any>,
    eventName: string,
    info: any,
    callback: (Array<any>) => void
  ): void => {
    emitEventCallback(component, eventName, info, callback);
  },
};

// Exports
export default EventBridge;
export {
  enhanceForEventsSupport,
  enhanceForEventsSupportEnhanced,
  enhanceForEventsSupportDecorator,
};
