import React, {useEffect, useMemo, useState} from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import io from 'socket.io-client';
const dirs = RNFetchBlob.fs.dirs;
const path = Platform.select({
  ios: 'hello.m4a',
  android: `${dirs.CacheDir}/hello.mp3`,
});

const audioRecorderPlayer = new AudioRecorderPlayer();
const App = () => {
  const [recordSecs, setRecordSecs] = useState();
  const [recordTme, setrecordTme] = useState();
  const [currentPositionSec, setCurrentPositionSec] = useState();
  const [curretnDurationSec, setcurretnDurationSec] = useState();
  const [playTime, setPlayTime] = useState();
  const [duration, setDuration] = useState();

  const socket = useMemo(
    () =>
      io('http://localhost:9090', {
        autoConnect: false,
        reconnection: false,
      }),
    [],
  );
  useEffect(() => {
    socket.connect();
  }, []);

  const checkPermission = async () => {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        grants['android.permission.RECORD_AUDIO'] &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] &&
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onStartRecord = async () => {
    try {
      let per = await checkPermission();

      if (per) {
        const result = await audioRecorderPlayer.startRecorder(path);
        audioRecorderPlayer.addRecordBackListener(e => {
          setRecordSecs(e.currentPosition);
          setrecordTme(
            audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
          );

          return;
        });
        console.log(result);
      }
    } catch (error) {
      console.log('error start record');
    }
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordSecs(0);
    console.log(result);
  };

  const onStartPlay = async () => {
    console.log('onStartPlay');

    const msg = await audioRecorderPlayer.startPlayer();
    console.log(msg);
    audioRecorderPlayer.addPlayBackListener(e => {
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setCurrentPositionSec(e.currentPosition);
      setcurretnDurationSec(e.duration);
      return;
    });
  };

  const onPausePlay = async () => {
    await audioRecorderPlayer.pausePlayer();
  };

  const onStopPlay = async () => {
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };

  return (
    <View style={{flex: 1, justifyContent: 'space-between'}}>
      <View style={{}}>
        <Button onPress={() => onStartRecord()} title="start record" />
        <Button onPress={() => onStopRecord()} title="stop record" />
      </View>
      <View style={{}}>
        <Button
          color="green"
          onPress={() => socket.emit('testeMessage', 'ola')}
          title="send audio"
        />
      </View>
      <View style={{}}>
        <Button onPress={() => onStartPlay()} title="start play" />
        <Button onPress={() => onPausePlay()} title="pause play" />
        <Button onPress={() => onStopPlay()} title="stop play" />
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
