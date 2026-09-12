import { supabase } from '../supabase'

export async function getProfile(userId) {
  const {
    data,
    error
  } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function getVideo(id) {
  const {
    data,
    error
  } = await supabase
    .from('videos')
    .select(
      '*,profiles(id,full_name,city,country,position,age,current_club,club_verified)'
    )
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

export async function getPlayer(id) {
  const {
    data,
    error
  } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('account_type', 'player')
    .single()

  if (error) throw error

  return data
}

export async function getVideosForPlayer(playerId) {
  const {
    data,
    error
  } = await supabase
    .from('videos')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', {
      ascending: false
    })

  if (error) throw error

  return data || []
}

export async function isAdmin() {
  const {
    data,
    error
  } = await supabase.rpc('is_admin')

  if (error) return false

  return !!data
}

export async function uploadVideo({
  userId,
  file,
  duration,
  title,
  description
}) {
  if (!file.type.startsWith('video/')) {
    throw new Error('Please select a video file.')
  }

  if (file.size > 150 * 1024 * 1024) {
    throw new Error('Video must be 150MB or smaller.')
  }

  if (duration > 120) {
    throw new Error('Video must be 2 minutes or shorter.')
  }

  const safe = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    '_'
  )

  const path =
    `${userId}/${crypto.randomUUID()}-${safe}`

  const up = await supabase
    .storage
    .from('player-videos')
    .upload(
      path,
      file,
      {
        contentType: file.type,
        upsert: false
      }
    )

  if (up.error) throw up.error

  const {
    data: urlData
  } = supabase
    .storage
    .from('player-videos')
    .getPublicUrl(path)

  const ins = await supabase
    .from('videos')
    .insert({
      player_id: userId,
      title: title || file.name,
      description: description || '',
      video_url: urlData.publicUrl,
      storage_path: path,
      duration_seconds: Math.round(duration)
    })
    .select()
    .single()

  if (ins.error) {
    await supabase
      .storage
      .from('player-videos')
      .remove([path])

    throw ins.error
  }

  return ins.data
}

export async function deleteVideo(video) {
  const {
    error
  } = await supabase
    .from('videos')
    .delete()
    .eq('id', video.id)

  if (error) throw error

  if (video.storage_path) {
    await supabase
      .storage
      .from('player-videos')
      .remove([video.storage_path])
  }
}

export async function toggleLike(
  videoId,
  userId,
  liked
) {
  if (liked) {
    const {
      error
    } = await supabase
      .from('video_likes')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId)

    if (error) throw error
  } else {
    const {
      error
    } = await supabase
      .from('video_likes')
      .insert({
        video_id: videoId,
        user_id: userId
      })

    if (error) throw error
  }
}

export async function savePlayer(
  playerId,
  clubId,
  saved
) {
  if (saved) {
    const {
      error
    } = await supabase
      .from('saved_players')
      .delete()
      .eq('club_id', clubId)
      .eq('player_id', playerId)

    if (error) throw error
  } else {
    const {
      error
    } = await supabase
      .from('saved_players')
      .insert({
        club_id: clubId,
        player_id: playerId
      })

    if (error) throw error
  }
}

export async function incrementView(videoId) {
  await supabase.rpc(
    'increment_video_view',
    {
      p_video_id: videoId
    }
  )
}
