// connect-ai-slides-web: are the eyes open, and on the camera? macOS only (Vision face landmarks). MIT, CONNECT AI LAB.
// usage: swift tools/eyes.swift picture.jpg [more.jpg ...]   ->  one JSON line per picture
//   open = eye height / eye width (both eyes, mean). Under 0.17 the eyes read as closed.
//   py   = where the pupil sits inside the eye, 0 = bottom lid, 1 = top lid. Under 0.57 the person is probably looking down.
// The same measure as the eye check of connect-ai-video-motion (lesson 2).
import Foundation
import Vision
import ImageIO

for path in CommandLine.arguments.dropFirst() {
  let name = path.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"")
  guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    print("{\"file\":\"\(name)\",\"error\":\"cannot read\"}"); continue
  }
  let req = VNDetectFaceLandmarksRequest()
  req.revision = VNDetectFaceLandmarksRequestRevision3
  try? VNImageRequestHandler(cgImage: img).perform([req])
  let faces = req.results ?? []
  guard let f = faces.max(by: { $0.boundingBox.width < $1.boundingBox.width }), let lm = f.landmarks else {
    print("{\"file\":\"\(name)\",\"faces\":0}"); continue
  }
  func box(_ r: VNFaceLandmarkRegion2D?) -> (Double, Double, Double, Double)? {
    guard let p = r?.normalizedPoints, !p.isEmpty else { return nil }
    let xs = p.map { Double($0.x) }, ys = p.map { Double($0.y) }
    return (xs.min()!, xs.max()!, ys.min()!, ys.max()!)
  }
  var open = -1.0, py = -1.0
  if let l = box(lm.leftEye), let r = box(lm.rightEye) {
    open = ((l.3 - l.2) / max(1e-6, l.1 - l.0) + (r.3 - r.2) / max(1e-6, r.1 - r.0)) / 2
    if let lp = lm.leftPupil?.normalizedPoints.first, let rp = lm.rightPupil?.normalizedPoints.first {
      py = ((Double(lp.y) - l.2) / max(1e-6, l.3 - l.2) + (Double(rp.y) - r.2) / max(1e-6, r.3 - r.2)) / 2
    }
  }
  let b = f.boundingBox
  print(String(format: "{\"file\":\"%@\",\"faces\":%d,\"open\":%.3f,\"py\":%.3f,\"box\":[%.3f,%.3f,%.3f,%.3f]}", name, faces.count, open, py, b.minX, 1 - b.maxY, b.width, b.height))
}
