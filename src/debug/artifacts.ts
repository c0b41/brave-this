import debug from 'debug'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const debugArtifacts = debug('brave:artifacts')

export interface DebugContext {
  query: string
  enabled: boolean
  dir?: string
  mobile?: boolean
  lang?: string
  page?: number
}

function slugify(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

export function resolveDebugContext(query: string, opts: { mobile?: boolean; lang?: string; page?: number } = {}): DebugContext {
  const enabled = !!process.env.BRAVE_OUTPUT
  const baseDir = process.env.BRAVE_OUTPUT_DIR ? path.resolve(process.env.BRAVE_OUTPUT_DIR) : path.join(process.cwd(), 'data', 'debug')

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const hash = crypto.randomBytes(3).toString('hex')
  const dir = path.join(baseDir, `${ts}_${slugify(query)}_${hash}`)

  return { query, enabled, dir, ...opts }
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function saveHtml(ctx: DebugContext, html: string): Promise<string | null> {
  if (!ctx.enabled || !ctx.dir) return null
  try {
    await ensureDir(ctx.dir)
    const p = path.join(ctx.dir, 'page.html')
    await fs.writeFile(p, html, 'utf8')
    debugArtifacts('saved html -> %s', p)
    return p
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    debugArtifacts('html save failed: %s', message)
    return null
  }
}

export async function saveJsPayload(ctx: DebugContext, rawJs: string): Promise<string | null> {
  if (!ctx.enabled || !ctx.dir) return null
  try {
    await ensureDir(ctx.dir)
    const p = path.join(ctx.dir, 'payload.js')
    await fs.writeFile(p, rawJs, 'utf8')
    debugArtifacts('saved js -> %s', p)
    return p
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    debugArtifacts('js save failed: %s', message)
    return null
  }
}

export async function saveJsonPayload(ctx: DebugContext, jsData: unknown): Promise<string | null> {
  if (!ctx.enabled || !ctx.dir) return null
  try {
    await ensureDir(ctx.dir)
    const p = path.join(ctx.dir, 'payload.json')
    await fs.writeFile(p, JSON.stringify(jsData, null, 2), 'utf8')
    debugArtifacts('saved json -> %s', p)
    return p
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    debugArtifacts('json save failed: %s', message)
    return null
  }
}

export async function saveParsedResult(ctx: DebugContext, result: unknown): Promise<string | null> {
  if (!ctx.enabled || !ctx.dir) return null
  try {
    await ensureDir(ctx.dir)
    const p = path.join(ctx.dir, 'parsed.json')
    await fs.writeFile(p, JSON.stringify(result, null, 2), 'utf8')
    debugArtifacts('saved parsed -> %s', p)
    return p
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    debugArtifacts('parsed save failed: %s', message)
    return null
  }
}

export async function saveMeta(ctx: DebugContext, meta: Record<string, unknown>): Promise<void> {
  if (!ctx.enabled || !ctx.dir) return
  try {
    await ensureDir(ctx.dir)
    const p = path.join(ctx.dir, 'meta.json')
    await fs.writeFile(p, JSON.stringify({ query: ctx.query, ...meta, at: new Date().toISOString() }, null, 2), 'utf8')
    debugArtifacts('saved meta -> %s', p)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    debugArtifacts('meta save failed: %s', message)
  }
}
