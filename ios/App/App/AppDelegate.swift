import UIKit
import Capacitor
import Foundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 1. Network Configuration Check
        checkNetworkConfiguration()
        
        // 2. Configure Default Headers (if needed)
        configureAPIHeaders()
        
        // 3. Enable Debugging in Development
        #if DEBUG
        UserDefaults.standard.set(true, forKey: "WebKitDeveloperExtras")
        UserDefaults.standard.synchronize()
        #endif
        
        return true
    }

    // MARK: - Network Configuration
    private func checkNetworkConfiguration() {
        // Verify ATS exceptions are properly set
        if let ats = Bundle.main.infoDictionary?["NSAppTransportSecurity"] as? [String: Any] {
            print("ATS Configuration: \(ats)")
        } else {
            print("Warning: No ATS configuration found")
        }
    }
    
    private func configureAPIHeaders() {
        // Set default headers for all requests
        URLSessionConfiguration.default.httpAdditionalHeaders = [
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Papricut-iOS/\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")"
        ]
        
        // Capacitor-specific network configuration
        if let config = Bundle.main.url(forResource: "capacitor.config", withExtension: "json"),
           let data = try? Data(contentsOf: config),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            print("Capacitor Config: \(json)")
        }
    }

    // MARK: - Lifecycle Methods (keep existing)
    func applicationWillResignActive(_ application: UIApplication) { /* ... */ }
    func applicationDidEnterBackground(_ application: UIApplication) { /* ... */ }
    func applicationWillEnterForeground(_ application: UIApplication) { /* ... */ }
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Good place to check network reachability
        checkAPIConnectivity()
    }
    func applicationWillTerminate(_ application: UIApplication) { /* ... */ }

    // MARK: - URL Handling (keep existing)
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - API Connectivity Check
    private func checkAPIConnectivity() {
        guard let apiURL = URL(string: "https://your-api-base-url.com/health") else { return }
        
        let task = URLSession.shared.dataTask(with: apiURL) { data, response, error in
            if let error = error {
                print("API Connection Error: \(error.localizedDescription)")
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("API Connection Status: \(httpResponse.statusCode)")
            }
        }
        task.resume()
    }
}