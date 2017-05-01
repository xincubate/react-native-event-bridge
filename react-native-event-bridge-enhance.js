/**
 * react-native-event-bridge-enhance
 * @flow
 *
 */

// Mixin to provide the boilerplate that is needed for a event listener component
// as well as also supports automatic removing of subscription for event listeners
// if the listener is registered via the registerEventListener method.

import React, { Component } from 'react';
import { EmitterSubscription } from 'react-native';
import EventBridge from './index.js';

const enhanceForEventsSupport = (ComposedComponent: Component<any>) => {

  let _key = 'EventsBridgeEnhance_Listeners';

  return class extends (ComposedComponent:any) {

    static contextTypes = {
      rootTag: React.PropTypes.number,
    };

    componentWillUnmount () {
      super.componentWillUnmount && super.componentWillUnmount();
      let {
        [ _key ]: listeners,
      } = this;
      listeners && listeners.forEach((listener) => {
        listener.remove();
      });
      this[ _key ] = null;
    }

    registerEventListener(...listeners:Array<EmitterSubscription>) {
      let { [ _key ]: listenerList } = this;
      if (!listenerList) {
          this[ _key ] = listeners;
      } else {
        listenerList.push(...listeners);
      }
      return this;
    }
  }
};

export default enhanceForEventsSupport;

/********************************/
/* Experimental
/********************************/
const enhanceForEventsSupportEnhanced = (ComposedComponent: any) => {
  return class extends (ComposedComponent:any) {
    _subscribableSubscriptions: ?Array<EmitterSubscription>;

    static contextTypes = {
      rootTag: React.PropTypes.number,
    };

    componentWillMount() {
      this._subscribableSubscriptions = [];
    }

    componentWillUnmount() {
      this._subscribableSubscriptions && this._subscribableSubscriptions.forEach(
        (subscription) => subscription.remove()
      );
      this._subscribableSubscriptions = null;
    }

    registerEventListener(callback: any) {
      this._subscribableSubscriptions && this._subscribableSubscriptions.push(
        EventBridge.addEventListener(this, callback)
      );
    }

  }
};

function enhanceForEventsSupportDecorator() {
  return function (DecoratedComponent: Component<any>) {

    let _key = 'ViewControllerEventsListenerEnhance_listeners';

    return class extends (DecoratedComponent:any) {
      static contextTypes = {
        rootTag: React.PropTypes.number,
      };

      componentWillUnmount () {
        super.componentWillUnmount && super.componentWillUnmount();
        let {
          [ _key ]: listeners,
        } = this;
        listeners && listeners.forEach((listener) => {
          listener.remove();
        });
        this[ _key ] = null;
      }

      registerEventListener(...listeners:Array<EmitterSubscription>) {
        let { [ _key ]: listenerList } = this;
        if (!listenerList) {
            this[ _key ] = listeners;
        } else {
          listenerList.push(...listeners);
        }
        return this;
      }
    }
  }
}



export { enhanceForEventsSupportDecorator, enhanceForEventsSupportEnhanced };
