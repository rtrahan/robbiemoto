import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

const f = createUploadthing()

export const ourFileRouter = {
  // Image uploader for lot media
  lotImage: f({ image: { maxFileSize: '8MB', maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const { userId: clerkId } = await auth()
      
      if (!clerkId) throw new Error('Unauthorized')
      
      // Verify admin role
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
      })
      
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Only admins can upload images')
      }
      
      return { userId: clerkId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)
      
      return { uploadedBy: metadata.userId, url: file.url }
    }),
  
  // Video uploader for lot media
  lotVideo: f({ video: { maxFileSize: '32MB', maxFileCount: 2 } })
    .middleware(async ({ req }) => {
      const { userId: clerkId } = await auth()
      
      if (!clerkId) throw new Error('Unauthorized')
      
      // Verify admin role
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
      })
      
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Only admins can upload videos')
      }
      
      return { userId: clerkId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Video upload complete for userId:', metadata.userId)
      console.log('Video URL:', file.url)
      
      // TODO: Generate thumbnail for video
      
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
