/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

declare var global: {HermesInternal: null | {}};

const {useState} = React;

type Player = number;
type RawCard = {num: number; opener: Player | null};
type Card = RawCard & {id: number};
type PlayerResult = {player: Player; gotCardCount: number; tryCount: number};
type Result = PlayerResult[];

function newCard(num: number): RawCard {
  return {
    num,
    opener: null,
  };
}

function generateCards(count: number): Card[] {
  const rawCardPairs = [...Array(count / 2)].map((_, i) => [
    newCard(i + 1),
    newCard(i + 1),
  ]);
  const cards = rawCardPairs.flat();
  return cards.map((c, i) => ({...c, id: i}));
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i >= 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function playerName(player: Player) {
  return `${player + 1}ばん`;
}

function useGame(playerCount: number) {
  let _cards = generateCards(24);
  _cards = shuffle(_cards);
  const [cards, setCards] = useState(_cards);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(0);
  const [opened1, setOpened1] = useState<Card | null>(null);
  const [opened2, setOpened2] = useState<Card | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [matched, setMatched] = useState(false);
  const [tryCount, setTryCount] = useState(
    [...Array(playerCount)].map((_) => 0),
  );

  function toggleCard(targetCards: Card[], {opener}: {opener: Player | null}) {
    setCards(
      cards.map((c) => {
        const isTarget = !!targetCards.find((tc) => tc.id === c.id);
        if (isTarget) {
          return {...c, opener};
        } else {
          return c;
        }
      }),
    );
  }

  function incrementTryCount(player: Player) {
    const counts = [...tryCount];
    counts[player] += 1;
    setTryCount(counts);
  }

  function handleSelectCard(card: Card) {
    if (card.opener !== null || isTurnDone()) {
      return;
    }

    toggleCard([card], {opener: currentPlayer});
    if (!opened1) {
      setOpened1(card);
    } else if (!opened2) {
      setOpened2(card);
      setMatched(opened1.num === card.num);
      incrementTryCount(currentPlayer);
    }
  }

  function isTurnDone() {
    return opened1 && opened2;
  }

  function nextTurn() {
    if (isGameDone()) {
      const result = [...Array(playerCount)].map((_, player) => ({
        player,
        gotCardCount: cards.filter((c) => c.opener === player).length,
        tryCount: tryCount[player],
      }));
      setResult(result);
    } else if (isTurnDone()) {
      if (opened1!.num !== opened2!.num) {
        toggleCard([opened1!, opened2!], {opener: null});
        setCurrentPlayer((currentPlayer + 1) % playerCount);
      }
      setOpened1(null);
      setOpened2(null);
    }
  }

  function isGameDone() {
    return cards.every((c) => c.opener !== null);
  }

  return {
    cards,
    currentPlayer,
    handleSelectCard,
    nextTurn,
    isTurnDone,
    isGameDone,
    result,
    matched,
  };
}

type CardProps = {card: Card; onSelect: (card: Card) => void};
function Card({card, onSelect}: CardProps) {
  function handlePress() {
    onSelect(card);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.cardText}>
        {card.opener !== null ? card.num : '?'}
      </Text>
    </TouchableOpacity>
  );
}

type ResultProps = {result: Result; onDone: () => void};
function Result({result, onDone}: ResultProps) {
  const max = Math.max(...result.map((r) => r.gotCardCount));
  const winners = result.filter((r) => r.gotCardCount === max);

  return (
    <>
      <Text style={styles.title}>
        {winners.map((w) => `${playerName(w.player)}さん`).join('と')}
        のかち！
      </Text>
      <View style={styles.results}>
        {result.map((r, i) => (
          <Text key={i} style={styles.result}>
            {`${playerName(r.player)}さん: ${r.gotCardCount}枚, ${
              r.tryCount
            }回`}
          </Text>
        ))}
      </View>
      <TouchableOpacity onPress={onDone} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>もういっかい</Text>
      </TouchableOpacity>
    </>
  );
}

type GameProps = {playerCount: number; onDone: () => void};
function Game({playerCount, onDone}: GameProps) {
  const {
    cards,
    currentPlayer,
    handleSelectCard,
    nextTurn,
    isTurnDone,
    isGameDone,
    result,
    matched,
  } = useGame(playerCount);

  if (result) {
    return <Result result={result} onDone={onDone} />;
  }

  return (
    <>
      <Text style={styles.currentPlayerTitle}>{`${playerName(
        currentPlayer,
      )}さんどうぞ`}</Text>
      <View style={styles.cards}>
        {cards.map((card, i) => (
          <Card key={i} card={card} onSelect={handleSelectCard} />
        ))}
      </View>
      {isTurnDone() && (
        <>
          <Text style={styles.matched}>
            {matched ? 'せいかい' : 'まちがい'}
          </Text>
          <TouchableOpacity onPress={nextTurn} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {isGameDone() ? 'おわり' : 'つぎへ'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
}

type GameStartProps = {onSelectPlayerCount: (n: number) => void};
function GameStart({onSelectPlayerCount}: GameStartProps) {
  function handlePress(n: number) {
    return () => {
      onSelectPlayerCount(n);
    };
  }

  return (
    <>
      <Text style={styles.title}>しんけいすいじゃく！</Text>
      <Text style={styles.label}>なんにんであそぶ？</Text>
      <View style={styles.chooseContainer}>
        {[
          {n: 1, label: 'ひとり'},
          {n: 2, label: 'ふたり'},
          {n: 3, label: 'さんにん'},
          {n: 4, label: 'よにん'},
        ].map((n) => (
          <TouchableOpacity
            key={n.n}
            style={styles.playerCountButton}
            onPress={handlePress(n.n)}>
            <Text style={styles.playerCountButtonText}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function App() {
  const [playerCount, setPlayerCount] = useState<number | null>(null);

  function handleSelectPlayerCount(n: number) {
    return () => {
      setPlayerCount(n);
    };
  }

  function handleGameDone() {
    setPlayerCount(null);
  }

  const isGameStarted = playerCount !== null;

  return (
    <>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.body}>
            {isGameStarted ? (
              <Game playerCount={playerCount!} onDone={handleGameDone} />
            ) : (
              <GameStart onSelectPlayerCount={setPlayerCount} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    height: '100%',
  },
  title: {
    width: '100%',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 60,
    fontSize: 30,
  },
  label: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 20,
  },
  chooseContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playerCountButton: {
    backgroundColor: '#ddd',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 24,
    marginTop: 16,
    width: '50%',
  },
  playerCountButtonText: {
    textAlign: 'center',
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    marginLeft: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    backgroundColor: '#ddd',
  },
  cardText: {
    fontSize: 20,
  },
  primaryButton: {
    margin: 30,
    flex: 1,
    backgroundColor: '#007bff',
    padding: 20,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  results: {
    padding: 30,
  },
  result: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 12,
  },
  matched: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 24,
    textAlign: 'center',
  },
  currentPlayerTitle: {
    width: '100%',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30,
    fontSize: 25,
  },
});

export default App;
