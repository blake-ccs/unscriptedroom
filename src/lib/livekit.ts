import { Room, RoomEvent, createLocalTracks } from "livekit-client";

export type LivekitJoinOpts = {
  url: string;     // e.g. from env: import.meta.env.VITE_LIVEKIT_URL
  token: string;   // from your API /api/v1/livekit/token
};

export async function joinLivekit({ url, token }: LivekitJoinOpts) {
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
    // publishDefaults: { videoSimulcastLayers: [/* … */] }
  });

  room.on(RoomEvent.Disconnected, () => {
    // cleanup hooks here if needed
  });

  // Create mic track eagerly (optional)
  try {
    const tracks = await createLocalTracks({ audio: true });
    await room.connect(url, token, { audio: true, video: false });
    for (const t of tracks) await room.localParticipant.publishTrack(t);
  } catch {
    // join without media if permissions denied
    await room.connect(url, token, { audio: false, video: false });
  }

  return room;
}
