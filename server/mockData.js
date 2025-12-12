// Lightweight mock response for local testing without Kick API access
const mockChannelEbonivon = {
  channel: {
    id: 26102005,
    slug: 'ebonivon',
    name: 'Ebonivon',
    user: {
      id: 27120330,
      username: 'Ebonivon',
      bio: 'The Ebonivon',
      instagram: 'ebonivon',
      twitter: null,
      profile_pic:
        'https://files.kick.com/images/user/27120330/profile_image/conversion/a627ec1c-e650-4dbf-b294-812b07884b2f-fullsize.webp',
    },
    followersCount: 442397,
    livestream: {
      id: 87093449,
      is_live: true,
      playback_url:
        'https://fa723fc1b171.us-west-2.playback.live-video.net/api/video/v1/us-west-2.196233775518.channel.FVUTwgBcOK8j.m3u8?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCJ9.eyJhd3M6Y2hhbm5lbC1hcm4iOiJhcm46YXdzOml2czp1cy13ZXN0LTI6MTk2MjMzNzc1NTE4OmNoYW5uZWwvRlZVVHdnQmNPSzhqIiwiYXdzOmFjY2Vzcy1jb250cm9sLWFsbG93LW9yaWdpbiI6Imh0dHBzOi8va2ljay5jb20saHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20saHR0cHM6Ly8qLmtpY2subGl2ZSxodHRwczovL3BsYXllci5raWNrLmNvbSxodHRwczovL2FkbWluLmtpY2suY29tLGh0dHBzOi8vYmV0YS5raWNrLmNvbSxodHRwczovL25leHQua2ljay5jb20saHR0cHM6Ly9kYXNoYm9hcmQua2ljay5jb20saHR0cHM6Ly8qLnByZXZpZXcua2ljay5jb20saHR0cHM6Ly94Ym94LmtpY2suY29tLGh0dHBzOi8vcGxheXN0YXRpb24ua2ljay5jb20iLCJhd3M6c3RyaWN0LW9yaWdpbi1lbmZvcmNlbWVudCI6ZmFsc2UsImV4cCI6MTc2NTU0ODg4Nn0.qc1dmtMIyoHdZvyqZnuvh546KK1o09ojlZJMRaDfsYBkWDlE5AcxOUTW93KVMRnOIX3NPDhuDVbcWX21Xa3iFZ_jo42zr-gMQ5f0qo-LK3SbhmLzFMtKbxVYy22y6QS-',
      viewer_count: 412,
      session_title: 'Mock yayın',
      category: { name: 'Just Chatting' },
    },
  },
};

module.exports = { mockChannelEbonivon };
