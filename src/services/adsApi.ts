import api, { handleApiError, unwrapData, type V2Envelope } from './api'

export type AdPlatform = 'android' | 'ios'

export interface PlatformAdConfig {
  status: string
  [key: string]: unknown
}

export type AdsStatusMap = Partial<Record<AdPlatform | string, PlatformAdConfig>>

/** UI-friendly flags derived from platform status map */
export interface AdsStatusResponse {
  showAndroidAds: boolean
  showIOSAds: boolean
  raw: AdsStatusMap
}

export interface UpdateAdsStatusPayload {
  showAndroidAds?: boolean
  showIOSAds?: boolean
}

function isActive(status?: string): boolean {
  return String(status || '').toLowerCase() === 'active'
}

function mapToFlags(raw: AdsStatusMap): AdsStatusResponse {
  return {
    showAndroidAds: isActive(raw.android?.status),
    showIOSAds: isActive(raw.ios?.status),
    raw,
  }
}

export const adsApi = {
  getAdsStatus: async (): Promise<AdsStatusResponse> => {
    try {
      const response = await api.get<V2Envelope<AdsStatusMap>>('/admin/ads/status')
      const raw = unwrapData(response) || {}
      return mapToFlags(raw)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  updateAdsStatus: async (payload: UpdateAdsStatusPayload): Promise<AdsStatusResponse> => {
    try {
      if (payload.showAndroidAds !== undefined) {
        await api.patch<V2Envelope<unknown>>('/admin/ad-config/android', {
          status: payload.showAndroidAds ? 'active' : 'inactive',
        })
      }
      if (payload.showIOSAds !== undefined) {
        await api.patch<V2Envelope<unknown>>('/admin/ad-config/ios', {
          status: payload.showIOSAds ? 'active' : 'inactive',
        })
      }
      return adsApi.getAdsStatus()
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
