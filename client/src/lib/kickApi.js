const KICK_BASE = 'https://kick.com/api/v1/channels';
const USE_MOCK = import.meta.env?.VITE_KICK_USE_MOCK === '1';

const fallbackChannels = {
  ebonivon: {
    slug: 'ebonivon',
    user: {
      username: 'Ebonivon',
      bio: 'The Ebonivon',
      profile_pic:
        'https://files.kick.com/images/user/27120330/profile_image/conversion/a627ec1c-e650-4dbf-b294-812b07884b2f-fullsize.webp',
    },
    followersCount: 442397,
    livestream: {
      is_live: true,
      playback_url:
        'https://fa723fc1b171.us-west-2.playback.live-video.net/api/video/v1/us-west-2.196233775518.channel.FVUTwgBcOK8j.m3u8',
      session_title: 'Mock yayın',
      viewer_count: 412,
      category: { name: 'Just Chatting' },
    },
  },
  eray: {
    slug: 'eray',
    user: {
      username: 'Eray',
      bio: 'For Communication and Sponsorships: mail@eozkenar.com',
      profile_pic:
        'https://files.kick.com/images/user/11096104/profile_image/conversion/da996ef7-742a-4b50-8a9d-15045762577e-fullsize.webp',
    },
    followersCount: 578452,
    playback_url:
      'https://fa723fc1b171.us-west-2.playback.live-video.net/api/video/v1/us-west-2.196233775518.channel.Q9ODDTRmrmeT.m3u8',
    livestream: {
      is_live: false,
      session_title: 'Örnek veri',
      viewer_count: 0,
      category: { name: 'Just Chatting' },
    },
  },
};

const maybeMock = (slug) => {
  const key = slug?.toLowerCase();
  if (USE_MOCK && fallbackChannels[key]) return normalizeChannel(fallbackChannels[key], slug);
  return fallbackChannels[key] ? normalizeChannel(fallbackChannels[key], slug) : null;
};

function normalizeChannel(raw, fallbackSlug) {
  if (!raw) return { slug: fallbackSlug, isLive: false };
  const channel = raw.channel || raw;
  const user = channel.user || {};
  const livestream =
    channel.livestream || channel.live_stream || raw.livestream || raw.livestreams?.[0] || null;

  return {
    slug: channel.slug || fallbackSlug,
    name: user.username || channel.name || fallbackSlug,
    profilePic:
      user.profile_pic ||
      user.profile_picture ||
      channel.profile_pic ||
      channel.thumbnail_url ||
      null,
    title: livestream?.session_title || livestream?.title || channel.session_title || null,
    isLive: Boolean(livestream?.is_live || livestream?.isLive),
    viewerCount:
      livestream?.viewer_count ??
      livestream?.viewers ??
      livestream?.viewersCount ??
      livestream?.viewers_count ??
      0,
    category:
      livestream?.category?.name ||
      channel.category?.name ||
      channel.recent_categories?.[0]?.name ||
      null,
    playbackUrl:
      livestream?.playback_url || livestream?.source || channel.playback_url || raw.playback_url || null,
    thumbnailUrl:
      livestream?.thumbnail?.url ||
      livestream?.thumbnail_url ||
      livestream?.thumbnail ||
      channel.thumbnail_url ||
      null,
    raw,
  };
}

async function getChannel(slug) {
  const url = `${KICK_BASE}/${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!res.ok) {
    const mock = maybeMock(slug);
    if (mock) return mock;
    throw new Error(`Kick HTTP ${res.status}: ${text?.slice(0, 120) || 'Unknown error'}`);
  }

  try {
    if (!contentType.includes('application/json')) {
      const mock = maybeMock(slug);
      if (mock) return mock;
      throw new Error('Kick yanıtı JSON değil (muhtemelen CORS/Cloudflare engeli).');
    }
    const data = JSON.parse(text);
    return normalizeChannel(data, slug);
  } catch (err) {
    const mock = maybeMock(slug);
    if (mock) return mock;
    throw new Error(err.message || 'Kick yanıtı parse edilemedi.');
  }
}

async function getPlayback(slug) {
  // Same endpoint contains playback_url; keep API compatibility with player page.
  return getChannel(slug);
}

export { getChannel, getPlayback };
