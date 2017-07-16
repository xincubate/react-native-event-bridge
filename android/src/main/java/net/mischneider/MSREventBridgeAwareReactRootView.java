package net.mischneider;

import android.content.Context;
import android.support.annotation.AttrRes;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.AttributeSet;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;

import net.mischneider.MSREventBridgeEventReceiver;

/**
 * A {@link ReactRootView} that implements the {@link MSREventBridgeEventReceiver}.
 */
public class MSREventBridgeAwareReactRootView extends ReactRootView implements MSREventBridgeEventReceiver{

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
    public void onEvent(String name, ReadableMap info) {
        if (_eventBridgeEventReceiver == null) {
            return;
        }
        _eventBridgeEventReceiver.onEvent(name, info);
    }

    @Override
    public void onEventCallback(String name, ReadableMap info, Callback callback) {
        if (_eventBridgeEventReceiver == null) {
            return;
        }
        _eventBridgeEventReceiver.onEventCallback(name, info, callback);
    }
}
