
# react-native-event-bridge

Send and Receive events between React Native and native.

### DISCLAIMER

**This project is currently in beta**.

Core APIs are subject to change. We encourage people to try this library out and provide us feedback as we get it to a stable state.

## Getting started

`$ npm install react-native-event-bridge --save`

### Mostly automatic installation

`$ react-native link react-native-event-bridge`

### Manual installation

#### iOS

1. In Xcode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-event-bridge` and add `MSREventBridge.xcodeproj`
3. In Xcode, in the project navigator, select your project. Add `libMSREventBridge.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import net.mischneider.MSREventBridgePackage;` to the imports at the top of the file
  - Add `new MSREventBridgePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-event-bridge'
  	project(':react-native-event-bridge').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-event-bridge/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-event-bridge')
  	```


## Usage

For different usage examples look into the example and example-swift folder.

### Emit events from React Native

#### JavaScript
```javascript
import EventBridge from 'react-native-event-bridge';

// Emit an event from within a React component
EventBridge.emitEvent(this, 'PresentScreen');

// Emit an event with callback from within a React component
EventBridge.emitEventCallback(this, 'EventWithCallback', () => {
  Alert.alert("Callback Response", "Some Callback Response");
});
```

### Handle events from native

#### iOS:
```objc
// Receiver needs to conform to the MSREventBridgeEventReceiver protocol
@interface ViewController () <MSREventBridgeEventReceiver>
// ...
@end

// Implement the following two methods by receiver that conforms to MSREventBridgeEventReceiver

// Handle events
- (void)onEventWithName:(NSString *)eventName info:(nullable NSDictionary *)info
{
  // Handle events dispatched from React Native
  RCTLog(@"%@ - Received event: '%@', with info: %@", self.UUID.UUIDString, eventName, info);

  // Example for PresentScreen event
  if ([eventName isEqualToString:PresentScreenEvent] ) {
    ViewController *newViewController = [ViewController new];
    [self presentViewController:newViewController animated:YES completion:nil];
    return;
  }
  // ...
}

// Handle events with callback
- (void)onEventWithName:(NSString *)eventName info:(nullable NSDictionary *)info callback:(nullable RCTResponseSenderBlock)callback;
{
  // ...
}
```

#### Android:
```java
@Override
public void onEvent(final String name, final ReadableMap info) {
    Log.d(ReactConstants.TAG, this.getClass().getName() + ": Received event: ".concat(name));

    // Example to just present a new activity
    if (name.equals(PresentScreenEventName)) {
        Intent myIntent = new Intent(getBaseContext(), SecondActivity.class);
        startActivity(myIntent);
        return;
    }
    // ...
}
```

### Subscribe to events in React Native

#### JavaScript
```javascript
// Import EventBridge from the react-native-event-bridge native module
import EventBridge from 'react-native-event-bridge';

// Event listener need to define a rootTag contextType
static contextTypes = {
  rootTag: React.PropTypes.number,
};

// Add and remove as event listener
componentDidMount() {
  // Register for any kind of event that will be sent from the native side
  this._eventSubscription = EventBridge.addEventListener(this, (name, info) => {
    console.log("Received event from native: '" + name + "' with info: " + JSON.stringify(info));
  });
}

componentWillUnmount() {
  this._eventSubscription && this._eventSubscription.remove();
}
```

### Sending events from native

#### iOS
```objc
//...
// Get the RCTBridge
RCTBridge *bridge = ...;

// Send an event with name 'eventName' to listeners for this event within the React Native component hierarchy
// of that is managed by this view
[bridge.viewControllerEventEmitter emitEventForView:self.view name:@"eventName" info:@{
  @"rowSelected" : info[@"rowID"]
}];
/...
```

#### Android
```java
// Get the MSREventBridgeInstanceManagerProvider somehow
MSREventBridgeInstanceManagerProvider instanceManagerProvider =
        (MSREventBridgeInstanceManagerProvider)this.getApplicationContext();

// Emit event via MSREventBridgeModule
String rowID = ...;
WritableMap map = new WritableNativeMap();
map.putString("rowSelected", rowID);
MSREventBridgeModule.emitEventForActivity(this, instanceManagerProvider, "eventName", map);
```

### Example fetching data

#### JavaScript
```javascript
// Fetch some data
this.setState({
  isLoading: true
})

// Load some data and update the data source
EventBridge.emitEventInfoCallback(this, 'LoadData', {'count' : 10}, (error, result) => {
  this.setState({
    isLoading: false,
    dataSource: this.state.dataSource.cloneWithRows(result),
  });
});
```

#### iOS
```objc
- (void)onEventWithName:(NSString *)eventName info:(nullable NSDictionary *)info callback:(nullable RCTResponseSenderBlock)callback;
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
        callback(@[[NSNull null], responseData]);
      }

    });
    return;
  }
  // ...
}
```

#### Android
```java
@Override
public void onEventCallback(final String name, final ReadableMap info, final Callback callback) {
    Log.d(ReactConstants.TAG, this.getClass().getName() + ": Received event with callback: ".concat(name));

    final String activityClassName = this.getClass().getSimpleName();

    // Example how to load some async data
    if (name.equals(LoadDataEventName)) {
        final int count = info.getInt("count");

        // Simulate some data loading delay
        final Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                WritableArray array = new WritableNativeArray();
                for (int i = 0; i < count; i++) {
                    array.pushString("Row " + i + " - " + activityClassName);
                }

                callback.invoke(null, array); // First parameter is error and the second is data
            }
        }, 2000);

        return;
    }
    //...
}
```

## TODO:
- API refinements
- Improve documentation
- Publish to npm and CocoaPods
- Improve documentation around "enhanced" features
- Android: Fragment support

## License

Copyright 2017 Michael Schneider

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
