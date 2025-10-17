import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { isAdminAuthenticated } from '@/lib/auth'

const f = createUploadthing()

export const ourFileRouter = {
  // Image uploader for lot media
  lotImage: f({ image: { maxFileSize: '8MB', maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const isAdmin = await isAdminAuthenticated()
      
      if (!isAdmin) {
        throw new Error('Only admins can upload images')
      }
      
      return { userId: 'admin' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete')
      console.log('File URL:', file.url)
      
      return { uploadedBy: metadata.userId, url: file.url }
    }),
  
  // Video uploader for lot media
  lotVideo: f({ video: { maxFileSize: '32MB', maxFileCount: 2 } })
    .middleware(async ({ req }) => {
      const isAdmin = await isAdminAuthenticated()
      
      if (!isAdmin) {
        throw new Error('Only admins can upload videos')
      }
      
      return { userId: 'admin' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Video upload complete')
      console.log('Video URL:', file.url)
      
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
