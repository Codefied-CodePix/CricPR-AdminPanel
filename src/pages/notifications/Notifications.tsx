import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Send, X, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../components/ui/toast'
import { PlayerSelectionDialog } from '../../components/common/PlayerSelectionDialog'
import { notificationsApi, type SendNotificationPayload } from '../../services/notificationsApi'
import { usePlayers } from '../../hooks/usePlayers'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  target: z.enum(['all', 'selected']).optional(),
})

type NotificationFormData = z.infer<typeof notificationSchema>

export function Notifications() {
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      target: 'all',
    },
  })

  const targetValue = watch('target')

  useEffect(() => {
    if (targetValue === 'all') {
      setSelectedPlayerIds([])
    }
  }, [targetValue])

  const selectedPlayersParams = useMemo(() => {
    if (selectedPlayerIds.length === 0) return { page: 1, limit: 1 }
    return { page: 1, limit: 1000 }
  }, [selectedPlayerIds.length])

  const { playersData: allPlayersData } = usePlayers(
    selectedPlayerIds.length > 0 ? selectedPlayersParams : { page: 1, limit: 1 }
  )

  const selectedPlayers = useMemo(() => {
    if (!allPlayersData?.results || selectedPlayerIds.length === 0) return []
    return allPlayersData.results.filter((p) => selectedPlayerIds.includes(p.playerId))
  }, [allPlayersData, selectedPlayerIds])

  const onSubmit = async (data: NotificationFormData) => {
    setIsLoading(true)
    try {
      const payload: SendNotificationPayload = {
        title: data.title,
        body: data.message,
      }

      if (data.target === 'selected') {
        const userIds = selectedPlayers
          .map((p) => p.userId)
          .filter((id): id is string => Boolean(id))

        if (userIds.length === 0) {
          addToast({
            title: 'Error',
            description:
              'Selected players have no linked user accounts. Choose players with users, or send to all.',
            variant: 'destructive',
          })
          return
        }
        payload.userIds = userIds
      }

      await notificationsApi.sendNotification(payload)

      addToast({
        title: 'Success',
        description: 'Notification sent successfully',
        variant: 'success',
      })
      reset({ title: '', message: '', target: 'all' })
      setSelectedPlayerIds([])
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Push Notifications"
        description="Broadcast notifications to app users"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Send Notification</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register('title')} />
                {errors.title && (
                  <p className="text-sm text-red">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <textarea
                  id="message"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-sm text-red">{errors.message.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Select
                  id="target"
                  {...register('target')}
                  placeholder="Select target"
                >
                  <option value="all">All Users</option>
                  <option value="selected">Selected Users</option>
                </Select>
              </div>

              {targetValue === 'selected' && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setPlayerDialogOpen(true)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Select Players
                  </Button>

                  {selectedPlayers.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Players ({selectedPlayers.length})</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 max-h-32 overflow-y-auto">
                        {selectedPlayers.map((player) => (
                          <Badge
                            key={player.playerId}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {player.name}
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(player.playerId)}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-auto"
                disabled={
                  isLoading ||
                  (targetValue === 'selected' && selectedPlayerIds.length === 0)
                }
              >
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>About broadcasts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              V2 exposes <code className="text-xs">POST /admin/notifications/send</code> with
              <code className="text-xs"> title</code>, <code className="text-xs">body</code>, and
              optional <code className="text-xs">userIds</code> (user UUIDs).
            </p>
            <p>
              There is no admin broadcast history endpoint. Selected players are resolved to their
              linked <code className="text-xs">userId</code> before send.
            </p>
          </CardContent>
        </Card>
      </div>

      <PlayerSelectionDialog
        open={playerDialogOpen}
        onOpenChange={setPlayerDialogOpen}
        selectedPlayerIds={selectedPlayerIds}
        onSelect={setSelectedPlayerIds}
      />
    </div>
  )
}
