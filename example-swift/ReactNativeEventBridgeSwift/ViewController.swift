//
//  ViewController.swift
//  ReactNativeEventBridgeSwift
//
//  Created by Michael Schneider
//  Copyright © 2017 mischneider. All rights reserved.
//

import UIKit
import MSREventBridge

// MARK: ViewController

class ViewController: UIViewController {
    
    override func loadView() {
        // For demo purposes we just create the root view in here
        let jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.ios", fallbackResource: nil)
        let rootView = RCTRootView(bundleURL: jsCodeLocation,
                                   moduleName: "ReactNativeEventBridgeSwift",
                                   initialProperties: nil,
                                   launchOptions: nil)
        rootView?.backgroundColor = UIColor(red: 1, green: 1, blue: 1, alpha: 1)
        self.view = rootView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.title = "Swift Example"
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Send Native Event", style: .plain, target:self, action: #selector(ViewController.sendEvent))
    }
    
}

// MARK: MSREventBridgeEventReceiver

extension ViewController: MSREventBridgeEventReceiver {
    
    // MARK: Handle events from RN
    
    func onEvent(withName name: String!, info: [AnyHashable : Any]!) {
        print("Received event: \(name) with info \(info)")
    }
    
    func onEvent(withName name: String!, info: [AnyHashable : Any]!, callback: RCTResponseSenderBlock!) {
        print("Received event with callback: \(name) with info \(info)")
        callback([])
    }
}

// MARK: Sending Events

extension ViewController {
    func sendEvent() {
        if let rootView = self.view as? RCTRootView, let bridge = rootView.bridge {
            // Send an event to components subscribed in the root view
            bridge.viewControllerEventEmitter.emitEvent(for: rootView, name: "EventName", info: [:])
        }
    }
}
