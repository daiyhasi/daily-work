import Expo
import Foundation
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
#if DEBUG
    RCTDevLoadingViewSetEnabled(false)
#endif

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins
  private static let bundleLogQueue = DispatchQueue(label: "com.dailywork.bundle-log")
  private static var didLogFileLocation = false

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    let selectedURL = bundleURL()
    logBundleDecision("sourceURL selected=\(selectedURL?.absoluteString ?? "nil") bridge=\(bridge.bundleURL?.absoluteString ?? "nil")")
    return selectedURL ?? bridge.bundleURL
  }

  override func bundleURL() -> URL? {
#if DEBUG
    let packagerURL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
    let embeddedURL = embeddedBundleURL()
    logBundleDecision("packager=\(packagerURL?.absoluteString ?? "nil") embedded=\(embeddedURL?.absoluteString ?? "nil")")

    if let packagerURL, isPackagerBundleReady(at: packagerURL) {
      logBundleDecision("using Metro bundle")
      return packagerURL
    }

    logBundleDecision("using embedded fallback bundle")
    return embeddedURL ?? packagerURL
#else
    return embeddedBundleURL()
#endif
  }

  private func embeddedBundleURL() -> URL? {
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  }

  private func logBundleDecision(_ message: String) {
    NSLog("[DailyWorkBundle] %@", message)
    ReactNativeDelegate.appendBundleLog(message)
  }

  private static func appendBundleLog(_ message: String) {
    bundleLogQueue.async {
      guard let logURL = bundleLogFileURL() else {
        NSLog("[DailyWorkBundle] Could not resolve bundle log file URL")
        return
      }

      if !didLogFileLocation {
        didLogFileLocation = true
        NSLog("[DailyWorkBundle] Log file: %@", logURL.path)
      }

      let timestamp = ISO8601DateFormatter().string(from: Date())
      let line = "[\(timestamp)] \(message)\n"
      guard let data = line.data(using: .utf8) else {
        return
      }

      do {
        if FileManager.default.fileExists(atPath: logURL.path) {
          let handle = try FileHandle(forWritingTo: logURL)
          try handle.seekToEnd()
          try handle.write(contentsOf: data)
          try handle.close()
        } else {
          try data.write(to: logURL, options: .atomic)
        }
      } catch {
        NSLog("[DailyWorkBundle] Failed to write bundle log: %@", error.localizedDescription)
      }
    }
  }

  private static func bundleLogFileURL() -> URL? {
    guard let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
      return nil
    }

    let debugDirectoryURL = documentsURL.appendingPathComponent("DailyWorkDebug", isDirectory: true)
    do {
      try FileManager.default.createDirectory(at: debugDirectoryURL, withIntermediateDirectories: true)
    } catch {
      NSLog("[DailyWorkBundle] Failed to create debug log directory: %@", error.localizedDescription)
      return nil
    }

    return debugDirectoryURL.appendingPathComponent("daily-work-ios.log")
  }

#if DEBUG
  private func isPackagerBundleReady(at bundleURL: URL) -> Bool {
    var request = URLRequest(url: bundleURL)
    request.httpMethod = "HEAD"
    request.timeoutInterval = 0.35

    let semaphore = DispatchSemaphore(value: 0)
    var isReachable = false
    let task = URLSession.shared.dataTask(with: request) { _, response, error in
      defer {
        semaphore.signal()
      }

      guard let httpResponse = response as? HTTPURLResponse, (200..<400).contains(httpResponse.statusCode) else {
        self.logBundleDecision("Metro not ready: \(error?.localizedDescription ?? "no valid HTTP response")")
        return
      }

      self.logBundleDecision("Metro ready: HTTP \(httpResponse.statusCode)")
      isReachable = true
    }

    task.resume()
    _ = semaphore.wait(timeout: .now() + .milliseconds(400))
    task.cancel()

    return isReachable
  }
#endif
}
