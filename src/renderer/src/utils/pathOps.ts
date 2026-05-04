import paper from 'paper'

// Initialize paper in headless mode
if (typeof document !== 'undefined') {
  paper.setup(document.createElement('canvas'))
}

/** Runs a boolean path operation and returns the generated SVG path data. */
export function booleanOperation(
  path1Data: string,
  path2Data: string,
  operation: 'unite' | 'intersect' | 'subtract' | 'exclude' | 'divide'
): string[] {
  const p1 = new paper.Path(path1Data)
  const p2 = new paper.Path(path2Data)

  let result: paper.Item

  switch (operation) {
    case 'unite':
      result = p1.unite(p2)
      break
    case 'intersect':
      result = p1.intersect(p2)
      break
    case 'subtract':
      result = p1.subtract(p2)
      break
    case 'exclude':
      result = p1.exclude(p2)
      break
    case 'divide':
      result = p1.divide(p2)
      break
    default:
      return [path1Data]
  }

  // result can be a Path or a CompoundPath
  const pathData: string[] = []
  if (result instanceof paper.CompoundPath || result instanceof paper.Path) {
    pathData.push(result.pathData)
  } else if (result instanceof paper.Group) {
    result.children.forEach((child) => {
      if (child instanceof paper.Path || child instanceof paper.CompoundPath) {
        pathData.push(child.pathData)
      }
    })
  }

  return pathData
}

/** Converts supported primitive SVG shapes into path data. */
export function shapeToPath(type: string, attributes: Record<string, string>): string {
  let path: paper.Path | null = null

  switch (type) {
    case 'rect':
      path = new paper.Path.Rectangle(
        new paper.Point(parseFloat(attributes.x || '0'), parseFloat(attributes.y || '0')),
        new paper.Size(parseFloat(attributes.width || '0'), parseFloat(attributes.height || '0'))
      )
      break
    case 'circle':
      path = new paper.Path.Circle(
        new paper.Point(parseFloat(attributes.cx || '0'), parseFloat(attributes.cy || '0')),
        parseFloat(attributes.r || '0')
      )
      break
    case 'ellipse':
      path = new paper.Path.Ellipse(
        new paper.Rectangle(
          parseFloat(attributes.cx || '0') - parseFloat(attributes.rx || '0'),
          parseFloat(attributes.cy || '0') - parseFloat(attributes.ry || '0'),
          parseFloat(attributes.rx || '0') * 2,
          parseFloat(attributes.ry || '0') * 2
        )
      )
      break
    // Add more if needed
  }

  return path ? path.pathData : ''
}
