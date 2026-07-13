import { zipSync, strToU8 } from 'fflate'
import { pb } from '@/lib/pb'
import { toCsv } from './csv'
import { recordFolderNames } from './exportPaths'
import { buildIcs } from './ics'
import { downloadBlob } from './download'
import type { HealthRecord } from '@/lib/types'

/** "YYYY-MM-DD <titolo sanificato>", shared base name for zip and ics. */
function recordBaseName(record: HealthRecord): string {
  const name = recordFolderNames([record]).get(record.id)
  return name ?? record.id
}

/**
 * Single-visit export: same shape as the full export, scoped to one record
 * (faithful JSON + one-row simplified CSV + attachments).
 */
export async function buildRecordZip(
  record: HealthRecord,
  categoryName: string,
): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = {}
  files['referto.json'] = strToU8(JSON.stringify(record, null, 2))
  files['referto.csv'] = strToU8(toCsv(
    [{
      date: record.date,
      title: record.title,
      category: categoryName,
      tags: record.tags,
      description: record.description,
      files: (record.file ?? []).join('; '),
    }],
    ['date', 'title', 'category', 'tags', 'description', 'files'],
  ))

  const attachments = record.file ?? []
  if (attachments.length > 0) {
    const token = await pb.files.getToken()
    for (const filename of attachments) {
      const res = await fetch(pb.files.getUrl(record, filename, { token }))
      if (!res.ok) {
        throw new Error(`attachment download failed (${res.status}): ${filename}`)
      }
      files[`allegati/${filename}`] = new Uint8Array(await res.arrayBuffer())
    }
  }
  return zipSync(files)
}

/** Browser entry point: build the single-visit ZIP and download it. */
export async function exportRecordData(record: HealthRecord, categoryName: string): Promise<void> {
  const zip = await buildRecordZip(record, categoryName)
  downloadBlob(`kura-${recordBaseName(record)}.zip`, zip, 'application/zip')
}

/** Download the visit as a one-event .ics for calendar apps. */
export function downloadRecordIcs(record: HealthRecord): void {
  const ics = buildIcs({
    id: record.id,
    title: record.title,
    description: record.description,
    start: new Date(record.date),
  })
  downloadBlob(`kura-${recordBaseName(record)}.ics`, ics, 'text/calendar')
}
