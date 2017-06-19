require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name             = "MSREventBridge"
  s.version          = package["version"]
  s.summary          = package["description"]
  s.homepage         = "https://github.com/maicki/react-native-event-bridge"
  s.license          = "Apache 2.0"
  s.author           = { "Michael Schneider" => "mischneider1@gmail.com" }
  s.social_media_url = "https://twitter.com/maicki"
  s.platform         = :ios, "8.0"
  s.source           = { :git => "https://github.com/maicki/react-native-event-bridge.git", :tag => "#{s.version}" }

  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"
end
