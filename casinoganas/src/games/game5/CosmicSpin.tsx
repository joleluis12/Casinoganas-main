import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  SafeAreaView 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// 🎰 SÍMBOLOS DEL JUEGO
const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐", "🎁", "🍀", "🔔"];

// 🎮 COMPONENTE DE REEL CON GRID
const SlotReel = ({ symbol, spinning, delay }: any) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  useEffect(() => {
    if (spinning) {
      // Cambiar símbolos mientras gira
      const interval = setInterval(() => {
        setCurrentSymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }, 100);

      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        })
      ).start();

      return () => clearInterval(interval);
    } else {
      spinAnim.setValue(0);
      setCurrentSymbol(symbol);
    }
  }, [spinning, symbol]);

  const translateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  return (
    <View style={styles.reelCell}>
      <LinearGradient
        colors={["#1a237e", "#283593", "#3949ab"]}
        style={styles.cellGradient}
      >
        <Animated.Text 
          style={[
            styles.symbolText,
            { transform: [{ translateY }] }
          ]}
        >
          {currentSymbol}
        </Animated.Text>
      </LinearGradient>
    </View>
  );
};

// 💰 STAT BOX COMPONENT
const StatBox = ({ icon, label, value, color }: any) => {
  return (
    <View style={styles.statBox}>
      <LinearGradient
        colors={[color, color + "CC"]}
        style={styles.statGradient}
      >
        <Ionicons name={icon} size={16} color="#fff" />
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function SlotMachineGame() {
  const [balance, setBalance] = useState(90000);
  const [bet, setBet] = useState(1000);
  const [totalBet, setTotalBet] = useState(7000);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2], SYMBOLS[3], SYMBOLS[4]],
    [SYMBOLS[1], SYMBOLS[2], SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]],
    [SYMBOLS[2], SYMBOLS[3], SYMBOLS[4], SYMBOLS[5], SYMBOLS[6]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5], SYMBOLS[6], SYMBOLS[7]],
    [SYMBOLS[4], SYMBOLS[5], SYMBOLS[6], SYMBOLS[7], SYMBOLS[8]],
  ]);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);

  const winAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 🎲 LÓGICA DE SPIN
  const handleSpin = () => {
    if (spinning || balance < totalBet) return;

    setSpinning(true);
    setBalance(balance - totalBet);
    setShowWin(false);

    // Animación del botón
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Simular giro
    setTimeout(() => {
      const newReels = Array(5).fill(null).map(() =>
        Array(3).fill(null).map(() => 
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        )
      );
      setReels(newReels);
      setSpinning(false);

      // Calcular ganancia
      const win = calculateWin(newReels);
      if (win > 0) {
        setWinAmount(win);
        setBalance(prev => prev + win);
        setShowWin(true);
        
        Animated.sequence([
          Animated.spring(winAnim, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.delay(2500),
          Animated.timing(winAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setShowWin(false));
      }
    }, 2000);
  };

  // 💎 CALCULAR GANANCIA
  const calculateWin = (reels: any) => {
    // Línea central horizontal
    const centerLine = reels.map((reel: any) => reel[1]);
    const firstSymbol = centerLine[0];
    const matches = centerLine.filter((s: string) => s === firstSymbol).length;

    if (matches >= 3) {
      if (firstSymbol === "💎") return totalBet * 10;
      if (firstSymbol === "7️⃣") return totalBet * 8;
      if (firstSymbol === "⭐") return totalBet * 5;
      return totalBet * matches;
    }
    return 0;
  };

  // 💵 CAMBIAR APUESTA
  const changeBet = (amount: number) => {
    const newBet = Math.max(100, Math.min(bet + amount, 5000));
    setBet(newBet);
    setTotalBet(newBet * 7);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0d47a1", "#1565c0", "#1976d2", "#0d47a1"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ⭐ HEADER CON STATS */}
      <View style={styles.header}>
        <StatBox icon="wallet" label="BALANCE" value={`$${balance.toLocaleString()}`} color="#FF6B00" />
        <StatBox icon="diamond" label="TOTAL BET" value={totalBet} color="#4CAF50" />
        <StatBox icon="card" label="BET" value={bet} color="#2196F3" />
      </View>

      {/* 🏆 WIN BANNER */}
      <View style={styles.winContainer}>
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          style={styles.winBanner}
        >
          <Text style={styles.winTitle}>WIN</Text>
          {showWin && (
            <Animated.View
              style={{
                opacity: winAnim,
                transform: [{
                  scale: winAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              }}
            >
              <Text style={styles.winAmountText}>{winAmount.toLocaleString()}</Text>
            </Animated.View>
          )}
        </LinearGradient>
      </View>

      {/* 🎰 SLOT GRID (5x3) */}
      <View style={styles.slotContainer}>
        <LinearGradient
          colors={["rgba(255,215,0,0.3)", "rgba(255,215,0,0.15)"]}
          style={styles.slotFrame}
        >
          <View style={styles.gridContainer}>
            {reels.map((reel, colIndex) => (
              <View key={colIndex} style={styles.column}>
                {reel.map((symbol: string, rowIndex: number) => (
                  <SlotReel
                    key={`${colIndex}-${rowIndex}`}
                    symbol={symbol}
                    spinning={spinning}
                    delay={colIndex * 100}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* LÍNEA CENTRAL */}
          <View style={styles.centerLine} />
        </LinearGradient>
      </View>

      {/* 🎮 CONTROLES */}
      <View style={styles.controlsContainer}>
        {/* Botones de Apuesta */}
        <View style={styles.betControls}>
          <TouchableOpacity
            style={styles.betButton}
            onPress={() => changeBet(-500)}
            disabled={spinning}
          >
            <LinearGradient
              colors={["#FF6B6B", "#EE5A6F"]}
              style={styles.betButtonGradient}
            >
              <Ionicons name="remove" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.betDisplay}>
            <Text style={styles.betDisplayText}>{bet}</Text>
          </View>

          <TouchableOpacity
            style={styles.betButton}
            onPress={() => changeBet(500)}
            disabled={spinning}
          >
            <LinearGradient
              colors={["#4CAF50", "#45A049"]}
              style={styles.betButtonGradient}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* BOTÓN SPIN PRINCIPAL */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.spinButton}
            onPress={handleSpin}
            disabled={spinning || balance < totalBet}
          >
            <LinearGradient
              colors={
                spinning || balance < totalBet
                  ? ["#666", "#444"]
                  : ["#4CAF50", "#45A049", "#66BB6A"]
              }
              style={styles.spinGradient}
            >
              <Ionicons
                name={spinning ? "sync" : "play"}
                size={40}
                color="#fff"
              />
              <Text style={styles.spinText}>
                {spinning ? "SPINNING..." : "SPIN"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* BOTONES INFERIORES */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.smallButton}>
            <LinearGradient colors={["#2196F3", "#1976D2"]} style={styles.smallButtonGradient}>
              <Ionicons name="settings" size={20} color="#fff" />
              <Text style={styles.smallButtonText}>SETTINGS</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton}>
            <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.smallButtonGradient}>
              <Ionicons name="repeat" size={20} color="#fff" />
              <Text style={styles.smallButtonText}>AUTOSPIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton}>
            <LinearGradient colors={["#FF9800", "#F57C00"]} style={styles.smallButtonGradient}>
              <Ionicons name="list" size={20} color="#fff" />
              <Text style={styles.smallButtonText}>PAYTABLE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  statGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },
  winContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  winBanner: {
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: "#FFD700",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#fff",
    minHeight: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  winTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  winAmountText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginTop: 4,
  },
  slotContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  slotFrame: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  gridContainer: {
    flexDirection: "row",
    gap: 8,
  },
  column: {
    gap: 8,
  },
  reelCell: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  cellGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  symbolText: {
    fontSize: 36,
  },
  centerLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#FFD700",
    opacity: 0.7,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  betControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  betButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  betButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  betDisplay: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  betDisplayText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
  },
  spinButton: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  spinGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  spinText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 8,
  },
  smallButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  smallButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  smallButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
});