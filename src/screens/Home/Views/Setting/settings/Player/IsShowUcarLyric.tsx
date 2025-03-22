import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { memo } from 'react'
import { View } from 'react-native'
import { useSettingValue } from '@/store/setting/hook'


import CheckBoxItem from '../../components/CheckBoxItem'
import { showRemoteLyric } from '@/core/desktopLyric'
import { setLastLyric } from '@/core/player/playInfo'
import { updateNowPlayingUcarInfo } from '@/plugins/player/utils'
import playerState from '@/store/player/state'
import { state } from '@/plugins/player/playList'

export default memo(() => {
  const t = useI18n()
  const isShowUcarLyric = useSettingValue('player.isShowUcarLyric')
  const setShowUcarLyric = async(isShowUcarLyric: boolean) => {
  
    updateSetting({ 'player.isShowUcarLyric': isShowUcarLyric })
    void showRemoteLyric(isShowUcarLyric)
    if (!isShowUcarLyric) {
      setLastLyric()
      void updateNowPlayingUcarInfo((state.prevDuration || 0) * 1000, playerState.musicInfo.name, playerState.musicInfo.singer ?? '', playerState.musicInfo.album ?? '', undefined)
    }
  }

  return (
    <View style={styles.content}>
      <CheckBoxItem check={isShowUcarLyric} onChange={setShowUcarLyric} label={t('setting_play_show_ucar_lyric')} />
    </View>
  )
})


const styles = createStyle({
  content: {
    marginTop: 5,
  },
})

