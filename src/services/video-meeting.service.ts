import { Linking, Platform } from 'react-native';

export type VideoPlatform = 'google_meet' | 'ms_teams' | 'zoom' | 'webex' | 'generic';

export interface MeetingJoinOptions {
  url: string;
  preferNativeApp?: boolean;
}

function detectPlatform(url: string): VideoPlatform {
  const lower = url.toLowerCase();
  if (lower.includes('meet.google.com')) return 'google_meet';
  if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) return 'ms_teams';
  if (lower.includes('zoom.us')) return 'zoom';
  if (lower.includes('webex.com')) return 'webex';
  return 'generic';
}

function buildNativeDeepLink(platform: VideoPlatform, url: string): string | null {
  switch (platform) {
    case 'google_meet': {
      // Extract meeting code: meet.google.com/abc-defg-hij
      const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i);
      if (match?.[1]) return `googlemeet://${match[1]}`;
      return null;
    }
    case 'ms_teams': {
      // Teams deep link: msteams:l/meetup-join
      const encoded = encodeURIComponent(url);
      if (Platform.OS === 'ios') {
        return `msteams://l/meetup-join?deeplinkId=${encoded}`;
      }
      return `msteams://teams.microsoft.com/l/meetup-join?deeplinkId=${encoded}`;
    }
    case 'zoom': {
      // Zoom deep link: zoomus://zoom.us/join?confno=<id>
      const confnoMatch = url.match(/[?&]?j\/(\d+)/);
      if (confnoMatch?.[1]) return `zoomus://zoom.us/join?confno=${confnoMatch[1]}`;
      return null;
    }
    default:
      return null;
  }
}

export const videoMeetingService = {
  async join({ url, preferNativeApp = true }: MeetingJoinOptions): Promise<void> {
    const platform = detectPlatform(url);

    if (preferNativeApp) {
      const deepLink = buildNativeDeepLink(platform, url);
      if (deepLink) {
        const canOpen = await Linking.canOpenURL(deepLink);
        if (canOpen) {
          await Linking.openURL(deepLink);
          return;
        }
      }
    }

    // Fallback: open in system browser
    const canOpenWeb = await Linking.canOpenURL(url);
    if (canOpenWeb) {
      await Linking.openURL(url);
    }
  },

  detectPlatform,

  getPlatformInfo(url: string): { label: string; icon: string; color: string } {
    const platform = detectPlatform(url);
    const info: Record<VideoPlatform, { label: string; icon: string; color: string }> = {
      google_meet: { label: 'Google Meet', icon: 'videocam', color: '#1A73E8' },
      ms_teams: { label: 'Microsoft Teams', icon: 'people', color: '#6264A7' },
      zoom: { label: 'Zoom', icon: 'camera', color: '#2D8CFF' },
      webex: { label: 'Cisco Webex', icon: 'videocam-outline', color: '#00BEF3' },
      generic: { label: 'Join Meeting', icon: 'videocam-outline', color: '#7C3AED' },
    };
    return info[platform];
  },

  isVideoLink(url: string): boolean {
    return detectPlatform(url) !== 'generic';
  },
};
