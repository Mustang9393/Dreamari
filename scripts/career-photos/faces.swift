import Foundation
import Vision
import AppKit

let root = CommandLine.arguments[1]
let list = try! String(contentsOfFile: CommandLine.arguments[2], encoding: .utf8).split(separator: "\n")
for rel in list {
  let path = root + "/" + rel
  guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("\(rel)\tLOADFAIL"); continue }
  let w = cg.width, h = cg.height
  let faceReq = VNDetectFaceRectanglesRequest()
  let humanReq = VNDetectHumanRectanglesRequest()
  humanReq.upperBodyOnly = false
  let handler = VNImageRequestHandler(cgImage: cg, options: [:])
  try? handler.perform([faceReq, humanReq])
  // Vision coords: origin bottom-left, normalized. Convert to top-left fractions.
  var faces: [String] = []
  for f in (faceReq.results ?? []) {
    let b = f.boundingBox
    let top = 1 - (b.origin.y + b.height), bottom = 1 - b.origin.y
    let cx = b.origin.x + b.width/2
    faces.append(String(format: "%.3f,%.3f,%.3f,%.3f,%.2f", cx, top, bottom, b.width, f.confidence))
  }
  var humans: [String] = []
  for r in (humanReq.results ?? []) {
    let b = r.boundingBox
    humans.append(String(format: "%.3f,%.3f", 1 - (b.origin.y + b.height), 1 - b.origin.y))
  }
  print("\(rel)\t\(w)x\(h)\tF:\(faces.joined(separator: "|"))\tH:\(humans.joined(separator: "|"))")
}
