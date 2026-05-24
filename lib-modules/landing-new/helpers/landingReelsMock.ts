import type { TrendingReelDto } from '~/lib-modules/reels-research'

// Frozen sample data for the landing trends preview. Anonymous visitors don't
// have a workspace, so the real /trending-reels/global endpoint can't fire —
// these three keep the section populated. Author handles are placeholders;
// swap to real ones if needed. Thumbnails point at /public/landing/reels/.
export const landingReelsMock: TrendingReelDto[] = [
  {
    reelId: 'DVNy9tZjWfp',
    url: 'https://www.instagram.com/reel/DVNy9tZjWfp/',
    shortcode: 'DVNy9tZjWfp',
    description: 'Trend varsa biz de varız 😎 #anaokulu #okuloncesi #anasinifi #minikler #erkenyas',
    author: {
      username: 'anaokulu_askim',
      displayName: 'Anaokulu Aşkım',
      followerCount: 184_000,
      isVerified: false,
    },
    metrics: {
      plays: 29_000_000,
      likes: 2_617_823,
      comments: 0,
      shares: 406_600,
      saves: 188_000,
      viewsOverAuthorBaseline: 200,
    },
    category: 'KidsParenting',
    language: 'OTHER',
    addedAt: '2026-05-24T13:45:00.000Z',
    postedAt: '2026-02-26T09:10:00.000Z',
    publishedAt: '2026-02-26T09:10:00.000Z',
    durationSeconds: 13,
    previewImage: {
      objectId: 'landing-1',
      url: '/landing/reels/1.jpg',
      expiresAt: '2099-01-01T00:00:00.000Z',
    },
  },
  {
    reelId: 'DYeqLaFKxBR',
    url: 'https://www.instagram.com/reel/DYeqLaFKxBR/',
    shortcode: 'DYeqLaFKxBR',
    description: 'Бизаям трентдан қомадик 😅 ❤️',
    author: {
      username: 'beauty_lab_uz',
      displayName: 'Beauty Lab',
      followerCount: 12_400,
      isVerified: false,
    },
    metrics: {
      plays: 48_900_000,
      likes: 3_300_000,
      comments: 6_700,
      shares: 506_700,
      saves: 169_700,
      viewsOverAuthorBaseline: 4591.53,
    },
    category: 'BeautyHealth',
    language: 'OTHER',
    addedAt: '2026-05-24T09:51:00.000Z',
    postedAt: '2026-05-18T14:08:00.000Z',
    publishedAt: '2026-05-18T14:08:00.000Z',
    durationSeconds: 16,
    previewImage: {
      objectId: 'landing-2',
      url: '/landing/reels/2.jpg',
      expiresAt: '2099-01-01T00:00:00.000Z',
    },
  },
  {
    reelId: 'DYqGG5DNTxr',
    url: 'https://www.instagram.com/reel/DYqGG5DNTxr/',
    shortcode: 'DYqGG5DNTxr',
    description: 'Причем здесь бмв? 🤔\n\nЛюблю тебя, подпишись!',
    author: {
      username: 'bmw_xpress',
      displayName: 'BMW Xpress',
      followerCount: 47_500,
      isVerified: false,
    },
    metrics: {
      plays: 3_300_000,
      likes: 298_300,
      comments: 3_100,
      shares: 46_200,
      saves: 18_700,
      viewsOverAuthorBaseline: 412.71,
    },
    category: 'CarsMoto',
    language: 'RU',
    addedAt: '2026-05-24T13:50:00.000Z',
    postedAt: '2026-05-22T22:31:00.000Z',
    publishedAt: '2026-05-22T22:31:00.000Z',
    durationSeconds: 32,
    previewImage: {
      objectId: 'landing-3',
      url: '/landing/reels/3.jpg',
      expiresAt: '2099-01-01T00:00:00.000Z',
    },
  },
]
