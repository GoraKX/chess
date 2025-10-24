import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import Menu from './src/components/Menu';
import GameScreen from './src/screens/GameScreen';
import type { Difficulty, PlayerColor } from './src/types';

type Screen = 'menu' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');

  const safeAreaStyle = useMemo(() => [styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }], []);

  const handleStartGame = () => {
    setScreen('game');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  return (
    <SafeAreaView style={safeAreaStyle}>
      <ExpoStatusBar style="light" />
      {screen === 'menu' ? (
        <Menu
          name={playerName}
          difficulty={difficulty}
          color={playerColor}
          onNameChange={setPlayerName}
          onSelectDifficulty={setDifficulty}
          onSelectColor={setPlayerColor}
          onStart={handleStartGame}
        />
      ) : (
        <GameScreen
          playerName={playerName}
          playerColor={playerColor}
          difficulty={difficulty}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000'
  }
});
