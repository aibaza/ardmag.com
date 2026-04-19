import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface PageSpec {
  name: string
  url: string
  target_url: string
  target_selector: string | null
}

export interface Scope {
  base_url: string
  design_server: string
  pages: PageSpec[]
  viewports: string[]
}

export function loadScope(): Scope {
  const p = path.resolve(process.cwd(), '../../../reports/design-review/scope.yaml')
  return yaml.load(fs.readFileSync(p, 'utf8')) as Scope
}

export function screenshotPath(
  iteration: string,
  kind: 'current' | 'target',
  pageName: string,
  viewport: string
): string {
  return path.resolve(
    process.cwd(),
    `../../../reports/design-review/iteration-${iteration}/screenshots/${kind}/${pageName}-${viewport}.png`
  )
}
