import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';
var Buffer = require('buffer/').Buffer; // note: the trailing slash is important!

const options = {
  sampleRate: 32000, // default is 44100 but 32000 is adequate for accurate voice recognition
  channels: 1, // 1 or 2, default 1
  bitsPerSample: 16, // 8 or 16, default 16
  audioSource: 6, // android only (see below)
  bufferSize: 4096, // default is 2048
};
import socket from './utils/socket';

let rooms = [
  {
    id: 1,
    name_room: 'blue pen',
    room: [
      {
        name: 'igor',
      },
      {
        name: 'gig',
      },
      {
        name: 'gui',
      },
      {
        name: 'doc',
      },
    ],
  },
  {
    id: 2,

    name_room: 'pen blue',
    room: [
      {
        name: 'ism',
      },
      {
        name: 'jor',
      },
      {
        name: 'lu',
      },
      {
        name: 'eri',
      },
    ],
  },
  {
    id: 3,

    name_room: 'fut',
    room: [
      {
        name: 'pele',
      },
      {
        name: 'zico',
      },
      {
        name: 'gabigol',
      },
      {
        name: 'arrascaeta',
      },
    ],
  },
];

const App = () => {
  const [user, setUser] = React.useState({
    id_room: 0,
    user: 'IGOR',
  });

  const [onMic, setOnMic] = React.useState(false);

  const permission = async () => {
    try {
      console.log('first');
      let per = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      return per;
    } catch (error) {
      console.log(error);
    }
  };

  const initCall = async () => {
    try {
      let per = await permission();
      if (per['android.permission.RECORD_AUDIO'] === 'granted') {
        LiveAudioStream.init(options);
        LiveAudioStream.start();
        LiveAudioStream.on('data', data => {
          // base64-encoded audio data chunks
          var chunk = Buffer.from(data, 'base64');
          socket.emit('audioMessage', data);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (onMic) {
      socket.emit('teste', 'worl');

      initCall();
    } else {
      LiveAudioStream.stop();
    }

    return () => {
      LiveAudioStream.stop();
    };
  }, [onMic]);

  React.useLayoutEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.page}>
      {rooms.map(item => (
        <Pressable
          key={item.name_room}
          style={styles.roomContainer}
          onPress={() => setUser({id_room: item.id})}>
          <Text style={styles.titleRoom}>Sala {item.name_room}</Text>
          <View>
            {item.room.map(item => (
              <Text key={item.name} style={styles.text}>
                {item.name}
              </Text>
            ))}
          </View>
          {user.id_room === item.id && <Text style={styles.text}>IGOR</Text>}
        </Pressable>
      ))}
      <TouchableOpacity
        style={styles.micButton}
        onPress={() => setOnMic(!onMic)}>
        <Text style={{color: 'white'}}>{onMic ? 'Parar' : 'Falar'} </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  roomContainer: {
    borderWidth: 1,
    borderColor: '#735F32',
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: '#282A3A',
    borderRadius: 6,
    marginVertical: 12,
  },

  text: {
    color: 'white',
    fontSize: 16,
  },

  titleRoom: {
    color: '#C69749',
    fontWeights: 'bold',
    fontSize: 22,
  },

  micButton: {
    borderRadius: 120,
    height: 120,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C69749',
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
  },
});

export default App;
