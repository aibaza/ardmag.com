import {
  AbstractFileProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { FileTypes, Logger, S3FileServiceOptions } from "@medusajs/framework/types"
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { ulid } from "ulid"
import path from "path"
import { Readable, Writable } from "stream"
import { generateVariants, variantKey, VARIANT_SUFFIXES } from "./variants"

type InjectedDependencies = {
  logger: Logger
}

export class R2VariantsFileService extends AbstractFileProviderService {
  static identifier = "r2-variants"

  private logger_: Logger
  private client_: S3Client
  private bucket_: string
  private fileUrl_: string
  private cacheControl_: string
  private prefix_: string
  private downloadFileDuration_: number

  constructor(deps: InjectedDependencies, options: S3FileServiceOptions) {
    super()
    this.logger_ = deps.logger
    this.bucket_ = options.bucket
    this.fileUrl_ = options.file_url.replace(/\/$/, "")
    this.cacheControl_ = options.cache_control ?? "public, max-age=31536000"
    this.prefix_ = options.prefix ?? ""
    this.downloadFileDuration_ = options.download_file_duration ?? 3600
    this.client_ = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      credentials: options.access_key_id && options.secret_access_key
        ? { accessKeyId: options.access_key_id, secretAccessKey: options.secret_access_key }
        : undefined,
      forcePathStyle: true,
    })
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.file_url) throw new MedusaError(MedusaError.Types.INVALID_DATA, "r2-variants: file_url is required")
    if (!options.bucket) throw new MedusaError(MedusaError.Types.INVALID_DATA, "r2-variants: bucket is required")
    if (!options.region) throw new MedusaError(MedusaError.Types.INVALID_DATA, "r2-variants: region is required")
  }

  private decodeContent(content: string): Buffer {
    try {
      const decoded = Buffer.from(content, "base64")
      if (decoded.toString("base64") === content) return decoded
      return Buffer.from(content, "utf8")
    } catch {
      return Buffer.from(content, "binary")
    }
  }

  async upload(file: FileTypes.ProviderUploadFileDTO): Promise<FileTypes.ProviderFileResultDTO> {
    if (!file?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "r2-variants: filename is required")
    }

    const parsed = path.parse(file.filename)
    const fileKey = `${this.prefix_}${parsed.name}-${ulid()}${parsed.ext}`
    const content = this.decodeContent(file.content)

    await this.client_.send(
      new PutObjectCommand({
        Bucket: this.bucket_,
        Key: fileKey,
        Body: content,
        ContentType: file.mimeType,
        CacheControl: this.cacheControl_,
        Metadata: { "original-filename": encodeURIComponent(file.filename) },
      })
    )

    const original: FileTypes.ProviderFileResultDTO = {
      url: `${this.fileUrl_}/${encodeURIComponent(fileKey)}`,
      key: fileKey,
    }

    // Generate and upload variants; failures are non-fatal
    const variants = await generateVariants(file.content, file.filename).catch((err) => {
      this.logger_.warn(`r2-variants: variant generation failed for ${file.filename}: ${err}`)
      return []
    })

    await Promise.all(
      variants.map(async (v) => {
        const vKey = variantKey(fileKey, v.suffix)
        try {
          await this.client_.send(
            new PutObjectCommand({
              Bucket: this.bucket_,
              Key: vKey,
              Body: v.buffer,
              ContentType: v.contentType,
              CacheControl: this.cacheControl_,
            })
          )
        } catch (err) {
          this.logger_.warn(`r2-variants: failed to upload ${vKey}: ${err}`)
        }
      })
    )

    return original
  }

  async delete(
    fileData: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const items = Array.isArray(fileData) ? fileData : [fileData]

    await Promise.all(
      items.flatMap((item) => {
        const keys = [
          item.fileKey,
          ...VARIANT_SUFFIXES.map((s) => variantKey(item.fileKey, s)),
        ]
        return keys.map(async (key) => {
          try {
            await this.client_.send(new DeleteObjectCommand({ Bucket: this.bucket_, Key: key }))
          } catch {
            // Variant may not exist -- silently ignore
          }
        })
      })
    )
  }

  async getPresignedDownloadUrl(fileData: FileTypes.ProviderGetFileDTO): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket_, Key: fileData.fileKey })
    return getSignedUrl(this.client_, command, { expiresIn: this.downloadFileDuration_ })
  }

  async getDownloadStream(_fileData: FileTypes.ProviderGetFileDTO): Promise<Readable> {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "r2-variants: getDownloadStream not supported")
  }

  async getAsBuffer(fileData: FileTypes.ProviderGetFileDTO): Promise<Buffer> {
    const res = await this.client_.send(
      new GetObjectCommand({ Bucket: this.bucket_, Key: fileData.fileKey })
    )
    const chunks: Uint8Array[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of res.Body as any) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }

  async getUploadStream(_fileData: FileTypes.ProviderUploadStreamDTO): Promise<{
    writeStream: Writable
    promise: Promise<FileTypes.ProviderFileResultDTO>
    url: string
    fileKey: string
  }> {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "r2-variants: getUploadStream not supported")
  }

  async getPresignedUploadUrl(
    fileData: FileTypes.ProviderGetPresignedUploadUrlDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    const parsed = path.parse(fileData.filename)
    const fileKey = `${this.prefix_}${parsed.name}-${ulid()}${parsed.ext}`
    const command = new PutObjectCommand({
      Bucket: this.bucket_,
      Key: fileKey,
      ContentType: fileData.mimeType,
    })
    const url = await getSignedUrl(this.client_, command, { expiresIn: this.downloadFileDuration_ })
    return { url, key: fileKey }
  }
}
