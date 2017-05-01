package net.mischneider;

import com.facebook.react.ReactInstanceManager;

/**
 * Provides an ReactInstanceManager
 */
public interface MSREventBridgeInstanceManagerProvider {
    /**
     * Returns an ReactInstanceManager which can be used to emit events via `emitEventForActivity`
     */
    ReactInstanceManager getEventBridgeReactInstanceManager();
}
