/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

declare var global: {HermesInternal: null | {}};

function newCard(num) {
  return {
    num,
    opener: null,
  }
}

function generateCards(count: number) {
  const cards = [...Array(count / 2)].map((_, i) => [newCard(i + 1), newCard(i + 1)]).flat()
  return cards.map((c, i) => ({ ...c, id: i }))
}

function shuffle(arr) {
  for (let i = arr.length - 1; i >= 0; --i) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

function playerName(player) {
  return `${player + 1}ばん`
}

function useGame(playerCount: number) {
  let _cards = generateCards(24)
  _cards = shuffle(_cards)
  const [cards, setCards] = useState(_cards)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [opened1, setOpened1] = useState(null)
  const [opened2, setOpened2] = useState(null)
  const [result, setResult] = useState(null)
  const [matched, setMatched] = useState(false)

  function toggleCard(targetCards, { opener }) {
    setCards(cards.map(c => {
      const isTarget = !!targetCards.find(tc => tc.id === c.id)
      if (isTarget) {
        return { ...c, opener }
      } else {
        return c
      }
    }))
  }

  function handleSelectCard(card) {
    if (card.opener !== null || isTurnDone())
      return

    toggleCard([card], { opener: currentPlayer })
    if (!opened1) {
      setOpened1(card)
    } else if (!opened2) {
      setOpened2(card)
      setMatched(opened1.num === card.num)
    }
  }

  function isTurnDone() {
    return opened1 && opened2
  }

  function nextTurn() {
    if (isGameDone()) {
      const result = [...Array(playerCount)].map((_, player) => ({
        player,
        count: cards.filter(c => c.opener === player).length
      }))
      setResult(result)
    } else if (isTurnDone()) {
      if (opened1.num !== opened2.num) {
        toggleCard([opened1, opened2], { opener: null })
        setCurrentPlayer((currentPlayer + 1) % playerCount)
      }
      setOpened1(null)
      setOpened2(null)
    }
  }

  function isGameDone() {
    return cards.every(c => c.opener !== null)
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
  }
}

function Card({ card, onSelect }) {
  function handlePress() {
    onSelect(card)
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.cardText}>{ card.opener !== null ? card.num : '?' }</Text>
    </TouchableOpacity>
  )
}

function Result({ result, onDone }) {
  const max = Math.max(...result.map(r => r.count))
  const winners = result.filter(r => r.count === max)

  return (
    <>
      <Text style={styles.title}>
        { winners.map(w => `${playerName(w.player)}さん`).join('と') }
        のかち！
      </Text>
      <View style={styles.results}>
        {
          result.map((r, i) => (
            <Text key={i} style={styles.result}>
              {`${playerName(r.player)}さん: ${r.count}枚`}
            </Text>
          ))
        }
      </View>
      <TouchableOpacity onPress={onDone} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>もういっかい</Text>
      </TouchableOpacity>
    </>
  )
}

function Game({ playerCount, onDone }) {
  const {
    cards,
    currentPlayer,
    handleSelectCard,
    nextTurn,
    isTurnDone,
    isGameDone,
    result,
    matched,
  } = useGame(playerCount)

  if (result) {
    return (
      <Result result={result} onDone={onDone} />
    )
  }

  return (
    <>
      <Text style={styles.currentPlayerTitle}>{`${playerName(currentPlayer)}さんどうぞ`}</Text>
      <View style={styles.cards}>
        {
          cards.map((card, i) => <Card key={i} card={card} onSelect={handleSelectCard} />)
        }
      </View>
      {
        isTurnDone() && (
          <>
            <Text style={styles.matched}>{ matched ? 'せいかい' : 'まちがい' }</Text>
            <TouchableOpacity onPress={nextTurn} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{ isGameDone() ? 'おわり' : 'つぎへ' }</Text>
            </TouchableOpacity>
          </>
        )
      }
    </>
  )
}

function GameStart({ onSelectPlayerCount }) {
  function handlePress(n) {
    return () => { onSelectPlayerCount(n) }
  }

  return (
    <>
      <Text style={styles.title}>
        しんけいすいじゃく！
      </Text>
      <Text style={styles.label}>
        なんにんであそぶ？
      </Text>
      <View style={styles.chooseContainer}>
        {
          [
            { n: 1, label: 'ひとり' },
            { n: 2, label: 'ふたり' },
            { n: 3, label: 'さんにん' },
            { n: 4, label: 'よにん' }
          ].map((n) => (
            <TouchableOpacity key={n.n} style={styles.playerCountButton} onPress={handlePress(n.n)}>
              <Text style={styles.playerCountButtonText}>{n.label}</Text>
            </TouchableOpacity>
          ))
        }
      </View>
    </>
  )
}

function App() {
  const [playerCount, setPlayerCount] = useState(null)

  function handleSelectPlayerCount(n) {
    return () => { setPlayerCount(n) }
  }

  function handleGameDone() {
    setPlayerCount(null)
  }

  const isGameStarted = playerCount !== null

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            {
              isGameStarted
              ? <Game playerCount={playerCount} onDone={handleGameDone} />
              : <GameStart onSelectPlayerCount={setPlayerCount} />
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
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
})

export default App
