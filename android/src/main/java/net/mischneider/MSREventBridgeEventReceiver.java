package net.mischneider;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;

/**
 * Handler that receive events posted from a subcomponent. Usually this interface is implemented by
 * an Activity
 */
public interface MSREventBridgeEventReceiver {
    /**
     * Event received from React Native
     */
    void onEvent(String name, ReadableMap info);

    /**
     * Event received from React Native. The callback must be called.
     */
    void onEventCallback(String name, ReadableMap info, Callback callback);
}
