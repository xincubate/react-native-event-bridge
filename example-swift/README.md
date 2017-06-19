# react-native-event-bridge Swift example

Example how to integrate `react-native-event-bridge` in an existing Swift (Xcode) project and CocoaPods.

## Run example
1. Navigate into `ReactNativeEventBridgeSwift/ReactNative/`
2. Execute `npm install`
3. Navigate back to root directory
4. Install CocoaPods by executing: `pod install`
5. Execute `npm start` in `ReactNativeeEventBridgeSwift/ReactNative/`
6. Open the `ReactNativeEventBridgeSwift` Xcode project and Run

## Setup for existing Xcode project
If you would like to integrate `react-native-event-bridge` into an existing Xcode project the following steps are necessary:
1. Execute `npm install react-native-event-bridge --save` in the React Native directory
2. Add the entry for the react-native-event-bridge library to your Podfile:
```
pod 'MSREventBridge', :path => './ReactNativeEventBridgeSwift/ReactNative/node_modules/react-native-event-bridge/MSREventBridge.podspec'
```
3. Run `pod install`
