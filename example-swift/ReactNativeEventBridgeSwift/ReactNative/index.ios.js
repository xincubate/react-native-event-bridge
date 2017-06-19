/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Alert
} from 'react-native';
import EventBridge from 'react-native-event-bridge';

export default class ReactNativeEventBridgeSwift extends Component {

  static contextTypes = {
    rootTag: React.PropTypes.number,
  };

  componentDidMount() {
    this._eventSubscription = EventBridge.addEventListener(this, (name, info) => {
      Alert.alert("Native Event", "Received Event from Native");
    });
  }

  componentWillUnmount() {
    this._eventSubscription && this._eventSubscription.remove();
  }
  
  buttonClicked = () => {
    // Emit an event from within a React component
    EventBridge.emitEvent(this, 'Event');
  }

  buttonClickedCallback = () => {
    // Emit an event with callback from within a React component
    EventBridge.emitEventCallback(this, 'EventWithCallback', () => {
      Alert.alert("Callback Response", "Some Callback Response");
    }); 
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native Event Bridge!
        </Text>
        <Button
          onPress={this.buttonClicked}
          title="Send RN Event"
        />
        <Button
          onPress={this.buttonClickedCallback}
          title="Send RN Event With Callback"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});

AppRegistry.registerComponent('ReactNativeEventBridgeSwift', () => ReactNativeEventBridgeSwift);
