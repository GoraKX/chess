import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  BackHandler,
  Alert
} from 'react-native';
import type { Difficulty, PlayerColor } from '../types';

export interface MenuProps {
  name: string;
  difficulty: Difficulty;
  color: PlayerColor;
  onNameChange: (value: string) => void;
  onSelectDifficulty: (value: Difficulty) => void;
  onSelectColor: (value: PlayerColor) => void;
  onStart: () => void;
  onQuit?: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function Menu({
  name,
  difficulty,
  color,
  onNameChange,
  onSelectDifficulty,
  onSelectColor,
  onStart,
  onQuit
}: MenuProps) {
  const handleQuit = () => {
    if (onQuit) {
      onQuit();
      return;
    }

    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      Alert.alert('Quit', 'Close the application to exit.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Chess</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={onNameChange}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <View style={styles.row}>
          {DIFFICULTIES.map((level) => (
            <SelectableButton
              key={level}
              label={level.toUpperCase()}
              selected={difficulty === level}
              onPress={() => onSelectDifficulty(level)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Side</Text>
        <View style={styles.row}>
          <SelectableButton
            label="WHITE"
            selected={color === 'w'}
            onPress={() => onSelectColor('w')}
          />
          <SelectableButton
            label="BLACK"
            selected={color === 'b'}
            onPress={() => onSelectColor('b')}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onStart}>
        <Text style={styles.primaryButtonText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleQuit}>
        <Text style={styles.secondaryButtonText}>Quit</Text>
      </TouchableOpacity>
    </View>
  );
}

interface SelectableButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function SelectableButton({ label, selected, onPress }: SelectableButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.selectableButton, selected && styles.selectableButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.selectableButtonText, selected && styles.selectableButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  section: {
    marginTop: 24
  },
  sectionTitle: {
    color: '#bbb',
    fontSize: 16,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  selectableButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginHorizontal: 4,
    backgroundColor: '#1c1c1c'
  },
  selectableButtonSelected: {
    backgroundColor: '#3a3a3a',
    borderColor: '#6c63ff'
  },
  selectableButtonText: {
    color: '#bbb',
    textAlign: 'center',
    fontWeight: '600'
  },
  selectableButtonTextSelected: {
    color: '#fff'
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: '#6c63ff',
    paddingVertical: 14,
    borderRadius: 10
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444'
  },
  secondaryButtonText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Menu;
