/* eslint-disable no-console */
/**
 * Sample Event Bridge App
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ListView,
  TouchableHighlight,
  ActivityIndicator,
  Alert,
  EmitterSubscription,
} from 'react-native'; // Would yell at us as we don't use it for now

/* eslint-disable */ import EventBridge, {
  enhanceForEventsSupport,
  enhanceForEventsSupportDecorator,
  enhanceForEventsSupportEnhanced,
} from 'react-native-event-bridge';
/* eslint-enable */

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
      console.log(
        `Received event from native event: '${name}' with info: ${JSON.stringify(
          info
        )}`
      );
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
    /* eslint-disable no-unused-vars */ // For some reason info is marked as unused :/
    this._eventSubscription = EventBridge.addEventListener(
      this,
      (name, info) => {
        /* eslint-enable no-unused-vars */
        console.log(
          `Received event from native: ${name} with info: {JSON.stringify(info)}`
        );
      }
    );
  }

  componentWillUnmount() {
    if (this._eventSubscription) {
      this._eventSubscription.remove();
    }
  }

  render() {
    return (
      <View>
        <HeaderTitle title="Welcome Title!" />
        <Button
          onPress={this._onButtonPress}
          title="Learn More With Callback"
        />
      </View>
    );
  }

  // Another way to define a method that does not need to be bind. It's currently
  // in Stage 2 though
  _onButtonPress = () => {
    // Post an event to native with callback
    EventBridge.emitEventCallback(this, 'EventWithCallback', () => {
      Alert.alert('Callback Response', 'Some Callback Response');
    });
  };
}

// That's the main app component

const SHOW_LOADING_TEXT = false;

type AppProps = {};

type AppState = {
  isLoading: boolean,
  dataSource: ListView.DataSource,
};

/* eslint-disable */
export default class App extends Component {
  /* eslint-enable */
  _eventSubscription: ?EmitterSubscription;
  state: AppState;

  static contextTypes = {
    rootTag: React.PropTypes.number,
  };

  constructor(props: AppProps) {
    super(props);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      isLoading: true,
      dataSource: ds.cloneWithRows([]),
    };

    this._onButtonPress = this._onButtonPress.bind(this);
  }

  componentDidMount() {
    // Register for an event that comes from native
    this._eventSubscription = EventBridge.addEventListener(
      this,
      (name, info) => {
        console.log(
          `Received event from native event: '${name}' with info: ${JSON.stringify(
            info
          )}`
        );
        Alert.alert('Received Event From Native', JSON.stringify(info));
      }
    );

    // Load some data and update the data source
    EventBridge.emitEventInfoCallback(
      this,
      'LoadData',
      { count: 10 },
      (error, result) => {
        this.setState({
          isLoading: false,
          dataSource: this.state.dataSource.cloneWithRows(result),
        });
      }
    );
  }

  componentWillUnmount() {
    if (this._eventSubscription) {
      this._eventSubscription.remove();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderComponent />
        <Text style={styles.instructions}>What is Lorem Ipsum?</Text>
        <Button onPress={this._onButtonPress} title="Learn More" />
        <Text style={styles.instructions}>
          Lorem Ipsum is simply dummy text of {'\n'}
          the printing and typesetting industry.
        </Text>
        {this.state.isLoading
          ? this._renderLoadingComponent()
          : this._renderListComponent(this.state)}
        <Button onPress={this._onPresentScreen} title="Present New Screen" />
        <Button onPress={this._onDismissScreen} title="Dismiss Screen" />
      </View>
    );
  }

  _onButtonPress = () => {
    // Post an event to native
    EventBridge.emitEvent(this, 'LearnMore', { key: 'value' });
  };

  _renderLoadingComponent = () =>
    SHOW_LOADING_TEXT
      ? // Show loading text
        <View
          style={{
            flexGrow: 1.0,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>Loading</Text>
        </View>
      : // Show loading spinner
        <View
          style={{
            flexGrow: 1.0,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator />
        </View>;

  _renderListComponent = state =>
    <ListView
      enableEmptySections
      style={{}}
      dataSource={state.dataSource}
      renderRow={this._renderRow}
    />;

  /* eslint-disable */
  _renderRow = (
    rowData: string,
    sectionID: number,
    rowID: number,
    highlightRow: (sectionID: number, rowID: number) => void
  ) =>
    /* eslint-enable */
    <TouchableHighlight
      onPress={() => {
        this._pressRow(rowID);
        // highlightRow(sectionID, rowID);
      }}
    >
      <View>
        <Text style={styles.listViewRowText}>
          {rowData}
        </Text>
      </View>
    </TouchableHighlight>;

  _pressRow = (rowID: number) => {
    // Example how to pass up certain events like a row was selected
    EventBridge.emitEvent(this, 'DidSelectRow', { rowID });
  };

  _onPresentScreen = () => {
    EventBridge.emitEvent(this, 'PresentScreen');
  };

  _onDismissScreen = () => {
    EventBridge.emitEvent(this, 'DismissScreen');
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 10,
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
    marginTop: 10,
  },
  listViewRow: {
    height: 22,
  },
  listViewRowText: {
    fontSize: 16,
  },
});
