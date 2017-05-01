/**
 * Sample Event Bridge App
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Button,
  ListView,
  TouchableHighlight,
  ActivityIndicator,
  Alert,
  EmitterSubscription
} from 'react-native';

import EventBridge, {
  enhanceForEventsSupport,
  enhanceForEventsSupportDecorator,
  enhanceForEventsSupportEnhanced
} from 'react-native-event-bridge';


// Some Shared components

// Example to use the enhanceForEventsSupportEnhanced mixin that automatically
// add support for native event supports. This is necessary to enable this
// component to register for events
class HeaderTitle extends enhanceForEventsSupportEnhanced(Component) {

  componentDidMount() {
    // Register for an event that will be send from native. As we used
    // enhanceForEventsSupportEnhanced we don't have to handle the event subscription
    // ourselves
    this.registerEventListener((name, info) => {
      console.log("Received event from native event: '" + name + "' with info: " + JSON.stringify(info));
    });
  }

  render() {
    return (
      <Text style={styles.welcome}>
        {this.props.title}
      </Text>
    );
  }
}

class HeaderComponent extends Component {
  _eventSubscription: ?EmitterSubscription;

  static contextTypes = {
    rootTag: React.PropTypes.number,
  };

  componentDidMount() {
    // Register for an event that will be sent from the native side
    this._eventSubscription = EventBridge.addEventListener(this, (name, info) => {
      console.log("Received event from native: '" + name + "' with info: " + JSON.stringify(info));
    });
  }

  componentWillUnmount() {
    this._eventSubscription && this._eventSubscription.remove();
  }

  // Another way to define a method taht does not need to be bind. It's currently
  // in Stage 2 though
  _onButtonPress = () => {
    // Post an event to native with callback
    EventBridge.emitEventCallback(this, 'EventWithCallback', () => {
      Alert.alert("Callback Response", "Some Callback Response");
    });
  }

  render() {
    return (
      <View>
        <HeaderTitle title="Welcome Title!" />
        <Button onPress={this._onButtonPress} title="Learn More With Callback" />
      </View>
    );
  }
}

// That's the main app component

const SHOW_LOADING_TEXT = false;

type AppProps = {

};

type AppState = {
  isLoading: bool,
  dataSource: ListView.DataSource
};

export default class App extends Component {
  _eventSubscription: ?EmitterSubscription;
  state: AppState;

  static contextTypes = {
    rootTag: React.PropTypes.number,
  };

  constructor(props: AppProps) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      isLoading: true,
      dataSource: ds.cloneWithRows([]),
    };
  }

  componentDidMount() {
    // Register for an event that comes from native
    this._eventSubscription = EventBridge.addEventListener(this, (name, info) => {
      console.log("Received event from native event: '" + name + "' with info: " + JSON.stringify(info));
      Alert.alert("Received Event From Native", JSON.stringify(info));
    });

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
  }

  componentWillUnmount() {
    this._eventSubscription && this._eventSubscription.remove();
  }

  _onButtonPress = () => {
    // Post an event to native
    EventBridge.emitEvent(this, 'LearnMore', {'key':'value'});
  }

  _onPresentScreen = () => {
    EventBridge.emitEvent(this, 'PresentScreen');
  }

  _onDismissScreen = () => {
    EventBridge.emitEvent(this, 'DismissScreen');
  }

  _pressRow = (rowID: number) => {
    // Example how to pass up certain events like a row was selected
    EventBridge.emitEvent(this, 'DidSelectRow', {'rowID' : rowID});
  }

  _renderRow = (rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) => {
    return (
      <TouchableHighlight onPress={() => {
          this._pressRow(rowID);
          //highlightRow(sectionID, rowID);
        }}>
        <View>
          <Text style={styles.listViewRowText}>{rowData}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderComponent />
        <Text style={styles.instructions}>
          What is Lorem Ipsum?
        </Text>
        <Button onPress={this._onButtonPress.bind(this)} title="Learn More" />
        <Text style={styles.instructions}>
          Lorem Ipsum is simply dummy text of {'\n'}
          the printing and typesetting industry.
        </Text>
        {this.state.isLoading ? (
          SHOW_LOADING_TEXT ? (
              // Show loading text
              <View style={{flexGrow: 1.0, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20}}>Loading</Text>
              </View>
            ) : (
              // Show loading spinner
              <View style={{flexGrow: 1.0, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator />
              </View>
            )
        ) : (
          <ListView
          enableEmptySections={true}
          style={{}}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          />)}
        <Button onPress={this._onPresentScreen} title="Present New Screen" />
        <Button onPress={this._onDismissScreen} title="Dismiss Screen" />
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
    paddingTop: 10
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 10,
    marginTop: 10
  },
  listViewRow: {
    height: 22,
  },
  listViewRowText: {
    fontSize: 16
  }
});
