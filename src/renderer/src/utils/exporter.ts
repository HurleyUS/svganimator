import type { Keyframe, SVGElementNode } from '../store/useStore'

/** Serializes the current editor document and timeline keyframes into an animated SVG file. */
export function exportToSVG(elements: SVGElementNode[], keyframes: Keyframe[], duration: number): string {
  const generateStyles = () => {
    let styles = '<style>\n'

    // Group keyframes by element and property
    const grouped = keyframes.reduce(
      (acc, k) => {
        if (!acc[k.elementId]) acc[k.elementId] = {}
        if (!acc[k.elementId][k.property]) acc[k.elementId][k.property] = []
        acc[k.elementId][k.property].push(k)
        return acc
      },
      {} as Record<string, Record<string, Keyframe[]>>
    )

    Object.entries(grouped).forEach(([elId, props]) => {
      Object.entries(props).forEach(([prop, ks]) => {
        const animName = `anim_${elId}_${prop}`
        styles += `  #${elId} { animation: ${animName} ${duration}ms infinite linear; }\n`
        styles += `  @keyframes ${animName} {\n`

        ks.sort((a, b) => a.time - b.time).forEach((k) => {
          const percent = ((k.time / duration) * 100).toFixed(2)
          styles += `    ${percent}% { ${prop}: ${k.value}; }\n`
        })

        styles += `  }\n`
      })
    })

    styles += '</style>'
    return styles
  }

  const renderNode = (node: SVGElementNode): string => {
    if (!node.isVisible) return ''

    const attrs = Object.entries(node.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')

    const children = node.children.map(renderNode).join('')

    return `<${node.type} ${attrs}>${children}</${node.type}>`
  }

  const svgContent = elements.map(renderNode).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
${generateStyles()}
${svgContent}
</svg>`
}
