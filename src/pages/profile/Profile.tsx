import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Save, Pencil, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../components/ui/toast'
import { useAuthStore } from '../../store/useAuthStore'
import { authApi } from '../../services/authApi'
import { PageHeader } from '../../components/common/PageHeader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type NameFormData = z.infer<typeof nameSchema>

export function Profile() {
  const { user, updateUser } = useAuthStore()
  const { addToast } = useToast()
  const [isLoadingName, setIsLoadingName] = useState(false)
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors },
    reset: resetName,
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.name || '',
    },
  })

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0E795D&color=fff&size=256`
  const displayPhoto =
    photoPreview || user?.profilePicture || user?.profilePhoto || fallbackAvatar

  const handleNameSubmit = async (data: NameFormData) => {
    setIsLoadingName(true)
    try {
      const updated = await authApi.editName(data.name)
      updateUser({ name: updated.name || data.name })
      addToast({
        title: 'Success',
        description: 'Name updated successfully',
        variant: 'success',
      })
      setIsEditingName(false)
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update name',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingName(false)
    }
  }

  const handlePhotoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast({
          title: 'Error',
          description: 'Please select a valid image file',
          variant: 'destructive',
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: 'Error',
          description: 'Image size should be less than 5MB',
          variant: 'destructive',
        })
        return
      }
      setSelectedPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setIsEditingPhoto(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSubmit = async () => {
    if (!selectedPhotoFile) {
      addToast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    setIsLoadingPhoto(true)
    try {
      const uploaded = await authApi.editProfilePhoto(selectedPhotoFile)
      const url = uploaded.url || photoPreview
      if (url && uploaded.url) {
        try {
          await authApi.setProfilePictureUrl(uploaded.url)
        } catch {
          // Upload with type=profilePicture already persists on the server
        }
      }
      if (url) {
        updateUser({ profilePicture: url, profilePhoto: url })
      }

      addToast({
        title: 'Success',
        description: 'Profile photo updated successfully',
        variant: 'success',
      })
      setIsEditingPhoto(false)
      setSelectedPhotoFile(null)
      setPhotoPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile photo',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingPhoto(false)
    }
  }

  const handleCancelPhotoEdit = () => {
    setIsEditingPhoto(false)
    setSelectedPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">User data not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your profile information"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative"
                >
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                    <AvatarImage src={displayPhoto} alt={user.name} />
                    <AvatarFallback className="bg-primary text-white text-3xl">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center space-y-1 w-full">
                <div className="flex items-center justify-center gap-2 group/name">
                  {isEditingName ? (
                    <form
                      onSubmit={handleSubmitName(handleNameSubmit)}
                      className="flex items-center gap-2 w-full max-w-xs"
                    >
                      <Input
                        {...registerName('name')}
                        className="flex-1 border-2 focus:border-primary"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoadingName}
                        className="flex-shrink-0"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setIsEditingName(false)
                          resetName()
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover/name:opacity-100"
                        title="Edit name"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                {nameErrors.name && (
                  <p className="text-sm text-red">{nameErrors.name.message}</p>
                )}
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-semibold">{user.role || 'Admin'}</p>
                </div>
                <Badge variant="outline">{user.role || 'Admin'}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Email Verified</p>
                  <p className="font-semibold">
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <Badge variant={user.isEmailVerified ? 'success' : 'secondary'}>
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{user.status || 'Active'}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {user.status || 'Active'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Password changes are managed via seeded admin credentials on the V2 API
              and are not available in this panel.
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isEditingPhoto}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelPhotoEdit()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {photoPreview && selectedPhotoFile ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={photoPreview} alt="Preview" />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm font-medium">{selectedPhotoFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedPhotoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handlePhotoSubmit}
                    disabled={isLoadingPhoto}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoadingPhoto ? 'Saving...' : 'Save Photo'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelPhotoEdit}
                    disabled={isLoadingPhoto}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-sm text-muted-foreground text-center">
                  No file selected. Please select an image file.
                </p>
                <Button type="button" variant="outline" onClick={handleCancelPhotoEdit}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
