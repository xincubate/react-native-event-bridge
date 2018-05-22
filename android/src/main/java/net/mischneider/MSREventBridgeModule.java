package net.mischneider;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.content.LocalBroadcastManager;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.RootView;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module that handles receiving and sending events from and to React Native
 */
public class MSREventBridgeModule extends ReactContextBaseJavaModule implements MSREventBridgeEventEmitter {

  // Static Identifier for events that are sent to React Native. These needs to be in sync with iOS!
  private static final String EventBridgeModuleName = "MSREventBridge";
  private static final String EventBridgeModuleEventName = "MSREventBridgeModuleEvent";
  private static final String EventBridgeModuleEventReactTagKey = "reactTag";
  private static final String EventBridgeModuleEventNameKey = "eventName";
  private static final String EventBridgeModuleEventInfoKey = "info";

  // Passed in react context
  private ReactContext mReactContext;

  // LocalBroadcastReceiver

  // Used for internal communication between the module and the LocalBroadcastReceiver
  private static final String EventBridgeModuleIntentEventName = "EventBridgeModuleIntentEventName";
  private static final String EventBridgeModuleIntentEventDataKey = "EventBridgeModuleIntentEventDataKey";

  /**
   * Private class used to dispatch events to React Native
   */
  private LocalBroadcastReceiver mLocalBroadcastReceiver;
  private class LocalBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      Bundle data = intent.getBundleExtra(EventBridgeModuleIntentEventDataKey);
      mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit(EventBridgeModuleEventName, Arguments.fromBundle(data));
    }
  }

  // Lifecycle
  public MSREventBridgeModule(ReactApplicationContext reactContext) {
    super(reactContext);

    this.mReactContext = reactContext;
    this.mLocalBroadcastReceiver = new LocalBroadcastReceiver();
    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(reactContext);
    localBroadcastManager.registerReceiver(mLocalBroadcastReceiver, new IntentFilter(EventBridgeModuleIntentEventName));
  }

  // Name of the native module
  @Override
  public String getName() {
    return EventBridgeModuleName;
  }

  // Exported constants
  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("EventName", EventBridgeModuleEventName);
    constants.put("EventReactTagKey", EventBridgeModuleEventReactTagKey);
    constants.put("EventNameKey", EventBridgeModuleEventNameKey);
    constants.put("EventInfoKey", EventBridgeModuleEventInfoKey);
    return constants;
  }

  // Receive Events
  @Override
  public void onCatalystInstanceDestroy() {
      super.onCatalystInstanceDestroy();
      LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(mReactContext);
      localBroadcastManager.unregisterReceiver(mLocalBroadcastReceiver);
  }

  /**
   * Event received from React Native
   */
  @ReactMethod
  public void onEvent(final int reactTag, final String name, final ReadableMap info) {
    final UIManagerModule uiManager = getReactApplicationContext().getNativeModule(UIManagerModule.class);
    final int rootTag = uiManager.resolveRootTagFromReactTag(reactTag);
    uiManager.addUIBlock(new UIBlock() {
      @Override
      public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        View view = nativeViewHierarchyManager.resolveView(rootTag);
        if (view instanceof MSREventBridgeEventReceiver) {
          MSREventBridgeEventReceiver receiver = (MSREventBridgeEventReceiver) view;
          receiver.onEvent(name, info);
          return;
        }

        Context context = view.getContext();
        if (context instanceof MSREventBridgeEventReceiver) {
          MSREventBridgeEventReceiver receiver = (MSREventBridgeEventReceiver)context;
          receiver.onEvent(name, info);
        }
      }
    });
  }

  /**
   * Event received from React Native. The callback must be called.
   */
  @ReactMethod
  public void onEventCallback(final int reactTag, final String name, final ReadableMap info, final Callback callback) {
    final UIManagerModule uiManager = getReactApplicationContext().getNativeModule(UIManagerModule.class);
    final int rootTag = uiManager.resolveRootTagFromReactTag(reactTag);
    uiManager.addUIBlock(new UIBlock() {
      @Override
      public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        View view = nativeViewHierarchyManager.resolveView(rootTag);

        MSREventBridgeEventReceiver receiver = null;
        if (view instanceof MSREventBridgeEventReceiver) {
          receiver = (MSREventBridgeEventReceiver) view;
        } else if (view.getContext() instanceof MSREventBridgeEventReceiver) {
          receiver = (MSREventBridgeEventReceiver) view.getContext();
        } else {
          return;
        }

        receiver.onEventCallback(name, info, new MSREventBridgeReceiverCallback() {
          @Override
          public void onSuccess(Object data) {
            callback.invoke(null, data);
          }

          @Override
          public void onFailure(Object data) {
            callback.invoke(data, null);
          }
        });
      }
    });
  }

  // Emit Events

  /**
   * Post an event to all event subscriber for the given name
   * Example: MSREventBridgeModule.emitEventContext(getApplicationContext(), "eventName", data);
   */
  static public void emitEventContext(Context context, final String name, @Nullable WritableMap info) {
    Bundle bundle = new Bundle();
    bundle.putString(EventBridgeModuleEventNameKey, name);
    if (info != null) {
      bundle.putBundle(EventBridgeModuleEventInfoKey, Arguments.toBundle(info));
    }

    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(context);
    Intent customEvent= new Intent(EventBridgeModuleIntentEventName);
    customEvent.putExtra(EventBridgeModuleIntentEventDataKey, bundle);
    localBroadcastManager.sendBroadcast(customEvent);
  }

  /**
   * Post an event to all event subscriber for the given name
   * Uses emitEventContext and passes in the result of getReactApplicationContext()
   */
  public void emitEvent(final String name, @Nullable WritableMap info) {
    emitEventContext(getReactApplicationContext(), name, info);
  }

  /**
   * Emits and event to a an event subscriber within a component that lifes within the components tree
   * managed by the passed activity
   * Example: EventBridgeModule.emitEventForActivity(this, (MSREventBridgeInstanceManagerProvider)this.getContext(), "eventName", data);
   */
  static public void emitEventForActivity(Activity activity, MSREventBridgeInstanceManagerProvider instanceManagerProvider, final String name, @Nullable WritableMap info) {
    final MSREventBridgeModule module = MSREventBridgeModule.getEventBridgeModule(instanceManagerProvider);
    module.emitEventForActivity(activity, name, info);
  }

  /**
   * Emits and event to a an event subscriber within a component that lifes within the components tree
   * managed by the passed activity
   * Example: EventBridgeModule.emitEventForActivity(this, "eventName", data);
   */
  public void emitEventForActivity(Activity activity, final String name, @Nullable WritableMap info)  {

    List<View> rootViews = new ArrayList<>();
    findAllReactRootView(activity.findViewById(android.R.id.content),rootViews);

    //View reactRootView = findReactRootView(activity.findViewById(android.R.id.content));
    if (rootViews.size() == 0) {
      return;
    }

    // React tag is the identifier to be able to detect in ReactNativewhich component should receive
    // the event

    for (View rootView : rootViews){
      final int reactTag = rootView.getId();

      Bundle bundle = new Bundle();
      bundle.putInt(EventBridgeModuleEventReactTagKey, reactTag);
      bundle.putString(EventBridgeModuleEventNameKey, name);
      if (info != null) {
        bundle.putBundle(EventBridgeModuleEventInfoKey, Arguments.toBundle(info));
      }

      LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(activity);
      Intent customEvent= new Intent(EventBridgeModuleIntentEventName);
      customEvent.putExtra(EventBridgeModuleIntentEventDataKey, bundle);
      localBroadcastManager.sendBroadcast(customEvent);
    }


  }

  private View findReactRootView(View view) {
    if (view instanceof RootView) {
      return view;
    }

    if (!(view instanceof ViewGroup)) {
      return null;
    }

    View reactRootView = null;
    ViewGroup viewGroup = (ViewGroup) view;
    for (int i = 0; i < viewGroup.getChildCount(); i++) {
      reactRootView = findReactRootView(viewGroup.getChildAt(i));
      if (reactRootView != null) {
        break;
      }
    }

    return reactRootView;
  }


  private void findAllReactRootView(View view,List<View> rootViews) {
    if (view instanceof RootView) {
      rootViews.add(view);
      return ;
    }

    if (!(view instanceof ViewGroup)) {
      return ;
    }

    View reactRootView = null;
    ViewGroup viewGroup = (ViewGroup) view;
    for (int i = 0; i < viewGroup.getChildCount(); i++) {
      findAllReactRootView(viewGroup.getChildAt(i),rootViews);
      if (reactRootView != null) {
        break;
      }
    }
  }

  // Helper methods

  /**
   * Try to get the module from a given MSREventBridgeInstanceManagerProvider
   */
  static private MSREventBridgeModule getEventBridgeModule(MSREventBridgeInstanceManagerProvider instanceManagerProvider) {
    return instanceManagerProvider
            .getEventBridgeReactInstanceManager()
            .getCurrentReactContext()
            .getNativeModule(MSREventBridgeModule.class);
  }

}