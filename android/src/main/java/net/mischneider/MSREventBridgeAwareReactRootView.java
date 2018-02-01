package net.mischneider;

import android.content.Context;
import android.support.annotation.AttrRes;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.AttributeSet;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;
import java.util.List;

/**
 * A ReactRootView that implements the {@link MSREventBridgeEventReceiver}.
 */
public class MSREventBridgeAwareReactRootView extends ReactRootView implements MSREventBridgeEventReceiver {

    private MSREventBridgeEventReceiver _eventBridgeEventReceiver;

    public MSREventBridgeAwareReactRootView(@NonNull Context context) {
        super(context);
    }

    public MSREventBridgeAwareReactRootView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public MSREventBridgeAwareReactRootView(
            @NonNull Context context,
            @Nullable AttributeSet attrs,
            @AttrRes int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public void setEventBridgeEventReceiver(MSREventBridgeEventReceiver eventBridgeEventReceiver) {
        _eventBridgeEventReceiver = eventBridgeEventReceiver;
    }

    @Override
    public List<String> supportedEvents() {
        if (_eventBridgeEventReceiver == null) {
            return new ArrayList<>();
        }
        return _eventBridgeEventReceiver.supportedEvents();
    }

    @Override
    public boolean onEvent(String name, ReadableMap info) {
        if (_eventBridgeEventReceiver == null) {
            return false;
        }
        return _eventBridgeEventReceiver.onEvent(name, info);
    }

    @Override
    public boolean onEventCallback(String name, ReadableMap info, MSREventBridgeReceiverCallback callback) {
        if (_eventBridgeEventReceiver == null) {
            return false;
        }
        return _eventBridgeEventReceiver.onEventCallback(name, info, callback);
    }
}
