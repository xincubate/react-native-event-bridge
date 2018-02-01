package net.mischneider;

import com.facebook.react.bridge.ReadableMap;

import java.util.List;

/**
 * Handler that receive events posted from a subcomponent. Usually this interface is implemented by
 * an Activity
 */
public interface MSREventBridgeEventReceiver {

    /**
     * @return Return a list of supported event names.
     */
    List<String> supportedEvents();

    /**
     * Event received from React Native
     */
    boolean onEvent(String name, ReadableMap info);

    /**
     * Event received from React Native. The callback must be called.
     */
    boolean onEventCallback(String name, ReadableMap info, MSREventBridgeReceiverCallback callback);
}
