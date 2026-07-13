import Expo
import Foundation
import QuartzCore
import React
import ReactAppDependencyProvider

private enum DailyWorkDebugLog {
#if DEBUG
  private static let logQueue = DispatchQueue(label: "com.dailywork.debug-log")
  private static var didLogFileLocation = false
#endif

  static func append(category: String, _ message: String) {
#if DEBUG
    NSLog("[DailyWork%@] %@", category, message)

    logQueue.async {
      guard let logURL = logFileURL() else {
        NSLog("[DailyWork%@] Could not resolve debug log file URL", category)
        return
      }

      if !didLogFileLocation {
        didLogFileLocation = true
        NSLog("[DailyWork%@] Log file: %@", category, logURL.path)
      }

      let timestamp = ISO8601DateFormatter().string(from: Date())
      let line = "[\(timestamp)] [\(category)] \(message)\n"
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
        NSLog("[DailyWork%@] Failed to write debug log: %@", category, error.localizedDescription)
      }
    }
#endif
  }

#if DEBUG
  private static func logFileURL() -> URL? {
    guard let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
      return nil
    }

    let debugDirectoryURL = documentsURL.appendingPathComponent("DailyWorkDebug", isDirectory: true)
    do {
      try FileManager.default.createDirectory(at: debugDirectoryURL, withIntermediateDirectories: true)
    } catch {
      NSLog("[DailyWorkLaunch] Failed to create debug log directory: %@", error.localizedDescription)
      return nil
    }

    return debugDirectoryURL.appendingPathComponent("daily-work-ios.log")
  }
#endif
}

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  private var launchObservers: [NSObjectProtocol] = []

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let launchStartedAt = CACurrentMediaTime()
    DailyWorkDebugLog.append(category: "Launch", "didFinishLaunching begin")
#if DEBUG
    installLaunchObservers(startTime: launchStartedAt)
#endif

#if DEBUG
    RCTDevLoadingViewSetEnabled(false)
    DailyWorkDebugLog.append(category: "Launch", "dev loading view disabled")

    if ProcessInfo.processInfo.environment["DAILYWORK_USE_METRO"] == "1" {
      DailyWorkDebugLog.append(category: "Launch", "Metro dev support enabled by DAILYWORK_USE_METRO=1")
    } else {
      RCTDevSettingsSetEnabled(false)
      RCTBundleURLProviderAllowPackagerServerAccess(false)
      DailyWorkDebugLog.append(category: "Launch", "Metro packager access disabled for embedded debug bundle")
    }
#endif

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    DailyWorkDebugLog.append(category: "Launch", "React Native factory prepared in \(elapsedMilliseconds(since: launchStartedAt))ms")

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    DailyWorkDebugLog.append(category: "Launch", "startReactNative begin at \(elapsedMilliseconds(since: launchStartedAt))ms")
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    DailyWorkDebugLog.append(category: "Launch", "startReactNative returned at \(elapsedMilliseconds(since: launchStartedAt))ms")
#endif

    let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    DailyWorkDebugLog.append(category: "Launch", "didFinishLaunching end at \(elapsedMilliseconds(since: launchStartedAt))ms result=\(result)")
    return result
  }

#if DEBUG
  private func installLaunchObservers(startTime: CFTimeInterval) {
    let notificationCenter = NotificationCenter.default
    let notifications: [(Notification.Name, String)] = [
      (NSNotification.Name.RCTJavaScriptWillStartLoading, "JS will start loading"),
      (NSNotification.Name.RCTJavaScriptWillStartExecuting, "JS will start executing"),
      (NSNotification.Name.RCTJavaScriptDidLoad, "JS did load"),
      (NSNotification.Name.RCTJavaScriptDidFailToLoad, "JS did fail to load"),
      (NSNotification.Name.RCTContentDidAppear, "first RN content did appear"),
    ]

    launchObservers = notifications.map { notificationName, label in
      notificationCenter.addObserver(forName: notificationName, object: nil, queue: .main) { notification in
        var suffix = ""
        if let userInfo = notification.userInfo, !userInfo.isEmpty {
          suffix = " userInfo=\(userInfo)"
        }

        DailyWorkDebugLog.append(category: "Launch", "\(label) at \(self.elapsedMilliseconds(since: startTime))ms\(suffix)")
      }
    }
  }
#endif

  private func elapsedMilliseconds(since startTime: CFTimeInterval) -> Int {
    Int((CACurrentMediaTime() - startTime) * 1000)
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

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    logBundleDecision("sourceURL begin bridge=\(bridge.bundleURL?.absoluteString ?? "nil")")
    let selectedURL = bundleURL()
    logBundleDecision("sourceURL selected=\(selectedURL?.absoluteString ?? "nil") bridge=\(bridge.bundleURL?.absoluteString ?? "nil")")
    return selectedURL ?? bridge.bundleURL
  }

  override func bundleURL() -> URL? {
#if DEBUG
    let embeddedURL = embeddedBundleURL()
    logBundleDecision("embedded=\(embeddedURL?.absoluteString ?? "nil")")

    if let embeddedURL, !shouldPreferMetroBundle() {
      logBundleDecision("using embedded bundle")
      return embeddedURL
    }

    let packagerURL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
    logBundleDecision("packager=\(packagerURL?.absoluteString ?? "nil")")

    if let packagerURL, isPackagerBundleReady(at: packagerURL) {
      logBundleDecision("using Metro bundle")
      return packagerURL
    }

    logBundleDecision("embedded bundle missing, falling back to Metro")
    return embeddedURL ?? packagerURL
#else
    return embeddedBundleURL()
#endif
  }

  private func embeddedBundleURL() -> URL? {
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  }

  private func logBundleDecision(_ message: String) {
    DailyWorkDebugLog.append(category: "Bundle", message)
  }

#if DEBUG
  private func shouldPreferMetroBundle() -> Bool {
    ProcessInfo.processInfo.environment["DAILYWORK_USE_METRO"] == "1"
  }

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
