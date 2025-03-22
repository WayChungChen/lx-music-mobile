import { init as initLyricPlayer, toggleTranslation, toggleRoma, play, pause, stop, setLyric, setPlaybackRate } from '@/core/lyric'
import { updateSetting } from '@/core/common'
import { onDesktopLyricPositionChange, showDesktopLyric, onLyricLinePlay, showRemoteLyric } from '@/core/desktopLyric'
import playerState from '@/store/player/state'
import { updateNowPlayingTitles, updateNowPlayingUcarInfo } from '@/plugins/player/utils'
import { setLastLyric } from '@/core/player/playInfo'
import { state } from '@/plugins/player/playList'
import settingState from '@/store/setting/state'


const updateRemoteLyric = async(lrc?: string) => {
  setLastLyric(lrc)
  // console.log('歌曲信息：', playerState.musicInfo)
  if (lrc == null) {
    void updateNowPlayingTitles((state.prevDuration || 0) * 1000, playerState.musicInfo.name, playerState.musicInfo.singer ?? '', playerState.musicInfo.album ?? '')
  } else {
    const isShowUcarLyric = settingState.setting['player.isShowUcarLyric']
    if (isShowUcarLyric) {
      updateNowPlayingUcarInfo((state.prevDuration || 0) * 1000, playerState.musicInfo.name, `${playerState.musicInfo.singer ? `${playerState.musicInfo.singer}` : ''}`, playerState.musicInfo.album ?? '', lrc)
    } else {
      updateNowPlayingTitles((state.prevDuration || 0) * 1000, lrc, `${playerState.musicInfo.name}${playerState.musicInfo.singer ? ` - ${playerState.musicInfo.singer}` : ''}`, playerState.musicInfo.album ?? '')
    }
  }
}

export default async(setting: LX.AppSetting) => {
  await initLyricPlayer()
  await Promise.all([
    setPlaybackRate(setting['player.playbackRate']),
    toggleTranslation(setting['player.isShowLyricTranslation']),
    toggleRoma(setting['player.isShowLyricRoma']),
  ])

  if (setting['desktopLyric.enable']) {
    showDesktopLyric().catch(() => {
      updateSetting({ 'desktopLyric.enable': false })
    })
  }
  if (setting['player.isShowBluetoothLyric']) {
    showRemoteLyric(true).catch(() => {
      updateSetting({ 'player.isShowBluetoothLyric': false })
    })
  }
  if (setting['player.isShowUcarLyric']) {
    showRemoteLyric(true).catch(() => {
      updateSetting({ 'player.isShowUcarLyric': false })
    })
  }
  onDesktopLyricPositionChange(position => {
    updateSetting({
      'desktopLyric.position.x': position.x,
      'desktopLyric.position.y': position.y,
    })
  })
  onLyricLinePlay(({ text, extendedLyrics }) => {
    console.log('onLyricLinePlay', text)
    if (!text && !state.isPlaying) {
      void updateRemoteLyric()
    } else {
      void updateRemoteLyric(text)
    }
  })


  global.app_event.on('play', play)
  global.app_event.on('pause', pause)
  global.app_event.on('stop', stop)
  global.app_event.on('error', pause)
  global.app_event.on('musicToggled', stop)
  global.app_event.on('lyricUpdated', setLyric)
}
