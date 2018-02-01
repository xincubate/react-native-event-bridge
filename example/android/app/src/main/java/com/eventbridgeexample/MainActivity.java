package com.eventbridgeexample;

import android.content.Intent;
import android.os.Handler;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.common.ReactConstants;

import net.mischneider.MSREventBridgeEventReceiver;
import net.mischneider.MSREventBridgeInstanceManagerProvider;
import net.mischneider.MSREventBridgeReceiverCallback;
import net.mischneider.MSREventBridgeModule;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity implements MSREventBridgeEventReceiver {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "EventBridgeExample";
    }


    // EventBridgeEventReceiver

    final static String LearnMoreEventName = "LearnMore";
    final static String EventWithCallbackEventName = "EventWithCallback";
    final static String LoadDataEventName = "LoadData";
    final static String DidSelectRowEventName = "DidSelectRow";
    final static String PresentScreenEventName = "PresentScreen";
    final static String DismissScreenEventName = "DismissScreen";

    @Override
    public List<String> supportedEvents() {
        return Arrays.asList(
                LearnMoreEventName,
                EventWithCallbackEventName,
                LoadDataEventName,
                DidSelectRowEventName,
                PresentScreenEventName,
                DismissScreenEventName
        );
    }

    @Override
    public boolean onEvent(final String name, final ReadableMap info) {
        Log.d(ReactConstants.TAG, this.getClass().getName() + ": Received event: ".concat(name));

        MSREventBridgeInstanceManagerProvider instanceManagerProvider =
                (MSREventBridgeInstanceManagerProvider)this.getApplicationContext();

        // Example how to handle select row event
        if (name.equals(DidSelectRowEventName)) {
            // Grab the selected row id
            String rowID = info.getString("rowID");
            Log.d(ReactConstants.TAG, "Did select row with id: " + rowID);

            // Emit callback event
            WritableMap map = new WritableNativeMap();
            map.putString("rowSelected", ""+rowID);
            MSREventBridgeModule.emitEventForActivity(this, instanceManagerProvider, "eventName", map);
            return true;
        }

        // Example to just present a new activity
        if (name.equals(PresentScreenEventName)) {
            Intent myIntent = new Intent(getBaseContext(), SecondActivity.class);
            startActivity(myIntent);
            return true;
        }

        // Handle dismiss a screen
        if (name.equals(DismissScreenEventName)) {
            finish();
            return true;
        }

        // Emit callback event
        WritableMap map = new WritableNativeMap();
        map.putString("eventName", name);
        MSREventBridgeModule.emitEventForActivity(this, instanceManagerProvider, "eventName", map);
        return true;
    }

    @Override
    public boolean onEventCallback(final String name, final ReadableMap info, final MSREventBridgeReceiverCallback callback) {
        Log.d(ReactConstants.TAG, this.getClass().getName() + ": Received event with callback: ".concat(name));

        final String activityClassName = this.getClass().getSimpleName();

        // Example how to load some async data
        if (name.equals(LoadDataEventName)) {
            final int count = info.getInt("count");

            // Simulate some data loading delay
            final Handler handler = new Handler();
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    WritableArray array = new WritableNativeArray();
                    for (int i = 0; i < count; i++) {
                        array.pushString("Row " + i + " - " + activityClassName);
                    }
                    callback.onSuccess(array);
                }
            }, 2000);

            return true;
        }

        // Emit callback
        WritableMap map = new WritableNativeMap();
        map.putString("key", "value");
        callback.onSuccess(map);
        return true;
    }
}
