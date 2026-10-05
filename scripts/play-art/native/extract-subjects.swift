// Cuts every person out of a composed scene with Apple's on-device subject
// lifting (Vision's foreground instance mask, the same model as "Lift subject
// from background" in Photos). No network, no credits, no Codex.
//
// usage: swift extract-subjects.swift <input image> <output dir> [prefix]
// writes <prefix>-1.png, <prefix>-2.png ... one transparent PNG per subject,
// each cropped to that subject (left to right), and prints a JSON line per
// file with its bounding box (normalized, origin top-left) and pixel size.

import AppKit
import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
  FileHandle.standardError.write("usage: extract-subjects <image> <out dir> [prefix]\n".data(using: .utf8)!)
  exit(2)
}
let inputURL = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2], isDirectory: true)
let prefix = args.count > 3 ? args[3] : inputURL.deletingPathExtension().lastPathComponent
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

guard let ciImage = CIImage(contentsOf: inputURL) else {
  FileHandle.standardError.write("cannot read \(inputURL.path)\n".data(using: .utf8)!)
  exit(1)
}
let handler = VNImageRequestHandler(ciImage: ciImage)
let request = VNGenerateForegroundInstanceMaskRequest()
// Subject lifting also lifts objects (an aircraft, a landing gear), so
// people are found separately and only cutouts that contain a person are
// kept. Boxes are normalized, origin bottom-left.
let humans = VNDetectHumanRectanglesRequest()
humans.upperBodyOnly = false
try handler.perform([request, humans])
let people = (humans.results ?? []).filter { $0.confidence > 0.3 }.map { $0.boundingBox }
print(String(format: "{\"scene\":true,\"people\":%d}", people.count))
guard let result = request.results?.first, !people.isEmpty else { exit(0) }
let context = CIContext()
let extent = ciImage.extent

// One cutout per instance, then sort left to right so -1 is the leftmost.
var cuts: [(x: CGFloat, image: CIImage, box: CGRect, people: Int)] = []
for instance in result.allInstances {
  let maskBuffer = try result.generateScaledMaskForImage(forInstances: IndexSet(integer: instance), from: handler)
  let mask = CIImage(cvPixelBuffer: maskBuffer)
  let cut = ciImage.applyingFilter("CIBlendWithMask", parameters: [
    kCIInputBackgroundImageKey: CIImage.empty(),
    kCIInputMaskImageKey: mask,
  ])
  // Bounding box of the mask: scan its alpha.
  guard let cg = context.createCGImage(mask, from: extent) else { continue }
  let w = cg.width, h = cg.height
  var data = [UInt8](repeating: 0, count: w * h)
  let gray = CGColorSpaceCreateDeviceGray()
  let bmp = CGContext(data: &data, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w, space: gray, bitmapInfo: CGImageAlphaInfo.none.rawValue)!
  bmp.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
  var minX = w, minY = h, maxX = -1, maxY = -1
  for y in 0..<h { for x in 0..<w where data[y * w + x] > 24 {
    if x < minX { minX = x }; if x > maxX { maxX = x }
    if y < minY { minY = y }; if y > maxY { maxY = y }
  } }
  if maxX < 0 { continue }
  // data rows are top-down here; CI coordinates are bottom-up.
  let boxTopLeft = CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
  let ciBox = CGRect(x: CGFloat(minX), y: CGFloat(h - 1 - maxY), width: boxTopLeft.width, height: boxTopLeft.height)
  // How many detected people this cutout holds (by each person's centre).
  let norm = CGRect(x: ciBox.minX / extent.width, y: ciBox.minY / extent.height, width: ciBox.width / extent.width, height: ciBox.height / extent.height)
  let inside = people.filter { norm.contains(CGPoint(x: $0.midX, y: $0.midY)) }.count
  if inside == 0 { continue } // an object, not a person
  cuts.append((x: CGFloat(minX), image: cut.cropped(to: ciBox), box: boxTopLeft, people: inside))
}
cuts.sort { $0.x < $1.x }
for (i, entry) in cuts.enumerated() {
  let url = outDir.appendingPathComponent("\(prefix)-\(i + 1).png")
  try context.writePNGRepresentation(of: entry.image, to: url, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
  let b = entry.box
  let line = String(format: "{\"file\":\"%@\",\"x\":%.4f,\"y\":%.4f,\"w\":%.4f,\"h\":%.4f,\"px\":[%d,%d],\"touchesBottom\":%@,\"people\":%d}",
                    url.lastPathComponent, b.minX / extent.width, b.minY / extent.height, b.width / extent.width, b.height / extent.height,
                    Int(b.width), Int(b.height), (b.maxY >= extent.height - 2) ? "true" : "false", entry.people)
  print(line)
}
