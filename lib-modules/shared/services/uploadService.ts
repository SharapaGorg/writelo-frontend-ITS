/**
 * File Upload Service
 * Implements the two-step upload process for the new Writelo API:
 * 1. Initialize upload - get presigned S3 URL
 * 2. Upload to S3 - direct upload to storage
 * 3. Finalize upload - confirm upload and get file metadata
 */

import { ApiController } from '~/scripts/shared/api/controller'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import type {
  InitUploadRequest,
  InitUploadResponse,
  FinalizeUploadRequest,
  FinalizeUploadResponse,
} from '~/scripts/shared/types/workspace'

const api = new ApiController()

export interface UploadProgress {
  phase: 'init' | 'upload' | 'finalize' | 'done' | 'error'
  percent: number
  message: string
}

export type ProgressCallback = (progress: UploadProgress) => void

/**
 * Upload a file using the two-step process
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress
 * @returns The finalized file response with ID and type
 */
export async function uploadFile(
  file: File,
  onProgress?: ProgressCallback
): Promise<FinalizeUploadResponse> {
  const workspaceContext = useWorkspaceContext()
  const workspaceId = workspaceContext.requireWorkspaceId()

  try {
    // Step 1: Initialize upload
    onProgress?.({
      phase: 'init',
      percent: 0,
      message: 'Initializing upload...',
    })

    const initRequest: InitUploadRequest = {
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    }

    const initResponse = await api.initUpload(workspaceId, initRequest)

    onProgress?.({
      phase: 'upload',
      percent: 10,
      message: 'Uploading file...',
    })

    // Step 2: Upload to S3 using presigned URL
    await uploadToS3(file, initResponse, onProgress)

    onProgress?.({
      phase: 'finalize',
      percent: 90,
      message: 'Finalizing upload...',
    })

    // Step 3: Finalize upload
    const finalizeRequest: FinalizeUploadRequest = {
      objectId: initResponse.objectId,
      fileName: file.name,
    }

    const result = await api.finalizeUpload(workspaceId, finalizeRequest)

    onProgress?.({
      phase: 'done',
      percent: 100,
      message: 'Upload complete',
    })

    return result
  } catch (error) {
    onProgress?.({
      phase: 'error',
      percent: 0,
      message: error instanceof Error ? error.message : 'Upload failed',
    })
    throw error
  }
}

/**
 * Upload file directly to S3 using presigned URL
 */
async function uploadToS3(
  file: File,
  initResponse: InitUploadResponse,
  onProgress?: ProgressCallback
): Promise<void> {
  const formData = new FormData()

  // Add all form fields from the presigned URL response
  for (const [key, value] of Object.entries(initResponse.formFields)) {
    formData.append(key, value)
  }

  // Add the file last (required by S3)
  formData.append('file', file)

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        // Map S3 upload progress to 10-90% range
        const s3Percent = (event.loaded / event.total) * 100
        const overallPercent = 10 + (s3Percent * 0.8)
        onProgress({
          phase: 'upload',
          percent: Math.round(overallPercent),
          message: `Uploading... ${Math.round(s3Percent)}%`,
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed - network error'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'))
    })

    xhr.open('POST', initResponse.url)
    xhr.send(formData)
  })
}

/**
 * Upload multiple files
 * @param files Array of files to upload
 * @param onProgress Optional callback for overall progress
 * @returns Array of finalized file responses
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<FinalizeUploadResponse[]> {
  const results: FinalizeUploadResponse[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i])
    results.push(result)
    onProgress?.(i + 1, files.length)
  }

  return results
}

/**
 * Get download URL for a file
 * @param objectId Storage object ID
 * @returns Signed download URL
 */
export async function getDownloadUrl(objectId: string): Promise<string> {
  const workspaceContext = useWorkspaceContext()
  const workspaceId = workspaceContext.requireWorkspaceId()

  const response = await api.getStorageDownloadUrl(workspaceId, objectId)
  return response.url
}
