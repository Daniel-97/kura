import { zipSync, strToU8 } from 'fflate'
import { pb } from '@/lib/pb'
import { toCsv } from './csv'
import { recordFolderNames } from './exportPaths'
import { downloadBlob } from './download'
import type { HealthRecord, Category, BloodPressureRecord, Reminder } from '@/lib/types'

/**
 * Fetch every collection of the logged-in user and assemble the export ZIP.
 * Any failure (collection fetch or attachment download) aborts the whole
 * export: a silently partial backup is worse than a failed one.
 */
export async function buildExportZip(): Promise<Uint8Array> {
  const [records, categories, pressure, reminders] = await Promise.all([
    pb.collection('records').getFullList<HealthRecord>({ sort: '-date' }),
    pb.collection('categories').getFullList<Category>({ sort: 'name' }),
    pb.collection('blood_pressure').getFullList<BloodPressureRecord>({ sort: '-measured_at' }),
    pb.collection('reminders').getFullList<Reminder>({ sort: 'fire_at' }),
  ])

  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const recordTitle = new Map(records.map((r) => [r.id, r.title]))

  const files: Record<string, Uint8Array> = {}
  const putJson = (name: string, data: unknown) =>
    (files[name] = strToU8(JSON.stringify(data, null, 2)))

  putJson('referti.json', records)
  putJson('categorie.json', categories)
  putJson('promemoria.json', reminders)
  putJson('pressione.json', pressure)

  // Simplified CSVs: relations resolved to readable values for spreadsheets.
  files['referti.csv'] = strToU8(toCsv(
    records.map((r) => ({
      date: r.date,
      title: r.title,
      category: r.category ? categoryName.get(r.category) ?? '' : '',
      tags: r.tags,
      description: r.description,
      files: (r.file ?? []).join('; '),
    })),
    ['date', 'title', 'category', 'tags', 'description', 'files'],
  ))
  files['categorie.csv'] = strToU8(toCsv(categories, ['name', 'color']))
  files['promemoria.csv'] = strToU8(toCsv(
    reminders.map((r) => ({
      fire_at: r.fire_at,
      sent_at: r.sent_at ?? '',
      message: r.message ?? '',
      record: recordTitle.get(r.record) ?? '',
    })),
    ['fire_at', 'sent_at', 'message', 'record'],
  ))
  files['pressione.csv'] = strToU8(toCsv(
    pressure,
    ['measured_at', 'systolic', 'diastolic', 'pulse', 'notes'],
  ))

  // Attachments, one folder per record, downloaded with a file token
  // (the file field is protected).
  const withFiles = records.filter((r) => (r.file ?? []).length > 0)
  if (withFiles.length > 0) {
    const token = await pb.files.getToken()
    const folders = recordFolderNames(records)
    for (const record of withFiles) {
      for (const filename of record.file) {
        const url = pb.files.getUrl(record, filename, { token })
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`attachment download failed (${res.status}): ${filename}`)
        }
        files[`allegati/${folders.get(record.id)}/${filename}`] =
          new Uint8Array(await res.arrayBuffer())
      }
    }
  }

  // Attachments (pdf/jpeg/png…) are already compressed; level 6 for the rest
  // would buy little — keep the default and let fflate decide per file.
  return zipSync(files)
}

export function exportFileName(now = new Date()): string {
  return `kura-export-${now.toISOString().slice(0, 10)}.zip`
}

/** Browser entry point: build the ZIP and trigger the download. */
export async function exportAllData(): Promise<void> {
  downloadBlob(exportFileName(), await buildExportZip(), 'application/zip')
}
