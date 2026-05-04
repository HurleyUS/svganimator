import type { SVGElementNode } from '../store/useStore'

/** Finds the first SVG node with the requested id in a nested element tree. */
export function findElementById(nodes: SVGElementNode[], id: string): SVGElementNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node

    const found = findElementById(node.children, id)
    if (found) return found
  }

  return undefined
}

/** Walks every SVG node and returns the nodes that match the predicate. */
export function collectElements(
  nodes: SVGElementNode[],
  predicate: (node: SVGElementNode) => boolean
): SVGElementNode[] {
  const matches: SVGElementNode[] = []

  for (const node of nodes) {
    if (predicate(node)) matches.push(node)
    matches.push(...collectElements(node.children, predicate))
  }

  return matches
}
