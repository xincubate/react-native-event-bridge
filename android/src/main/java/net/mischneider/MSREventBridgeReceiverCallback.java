package net.mischneider;

import com.facebook.react.bridge.WritableMap;

/**
 * Callback for sending data to the React Native side
 */
public interface MSREventBridgeReceiverCallback {
    public void onSuccess(Object data);
    public void onFailure(Object error);
}
