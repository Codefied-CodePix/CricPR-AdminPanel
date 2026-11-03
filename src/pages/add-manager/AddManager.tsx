import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { PageHeader } from '../../components/common/PageHeader'
import { Switch } from '../../components/ui/switch'
import { Smartphone, Apple, Loader2 } from 'lucide-react'
import { useAdsStatus } from '../../hooks/useAdsStatus'
import { useToast } from '../../components/ui/toast'

export function AddManager() {
  const { addToast } = useToast()
  const { adsStatus, isLoading, isError, error, updateAdsStatus, isUpdating } = useAdsStatus()

  const handleIosChange = async (checked: boolean) => {
    try {
      await updateAdsStatus({ showIOSAds: checked })
      addToast({
        title: 'Updated',
        description: checked ? 'iOS ads are now shown.' : 'iOS ads are now hidden.',
        variant: 'default',
      })
    } catch (e) {
      addToast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Could not update iOS ads status.',
        variant: 'destructive',
      })
    }
  }

  const handleAndroidChange = async (checked: boolean) => {
    try {
      await updateAdsStatus({ showAndroidAds: checked })
      addToast({
        title: 'Updated',
        description: checked ? 'Android ads are now shown.' : 'Android ads are now hidden.',
        variant: 'default',
      })
    } catch (e) {
      addToast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Could not update Android ads status.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ads Config"
          description="Toggle advertisement visibility for iOS and Android"
        />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ads Config"
          description="Toggle advertisement visibility for iOS and Android"
        />
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            <p className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load ads status'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const showIOSAds = adsStatus?.showIOSAds ?? false
  const showAndroidAds = adsStatus?.showAndroidAds ?? false

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ads Config"
        description="Toggle advertisement visibility for iOS and Android"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              iOS Ads
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {showIOSAds ? 'Ads are currently shown on iOS' : 'Ads are currently hidden on iOS'}
            </p>
            <Switch
              checked={showIOSAds}
              onCheckedChange={handleIosChange}
              disabled={isUpdating}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Android Ads
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {showAndroidAds
                ? 'Ads are currently shown on Android'
                : 'Ads are currently hidden on Android'}
            </p>
            <Switch
              checked={showAndroidAds}
              onCheckedChange={handleAndroidChange}
              disabled={isUpdating}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
